import React, { useState } from 'react';
import { apiClient } from '../utils/apiClient';

export function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      localStorage.setItem('adminToken', response.token);
      onLogin(response.token, response.admin);
    } catch (err) {
          const message = err.message === 'Failed to fetch'
            ? 'Cannot reach the API server. Please check the backend deployment and try again.'
            : err.message;
      setError(message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sys-login-wrapper">
      <div className="sys-login-container">
        <div className="sys-login-header">
          <h1>Sangath Analytics</h1>
          <p>Sign in to your admin workspace</p>
        </div>

        <form className="sys-form" onSubmit={handleLogin}>
          <div className="sys-input-group">
            <label>Email</label>
            <input
              className="sys-input"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="sys-input-group">
            <label>Password</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                className="sys-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="sys-btn-outline"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button type="submit" className="sys-btn-primary" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {error && <div className="sys-error-msg">{error}</div>}
      </div>
    </div>
  );
}