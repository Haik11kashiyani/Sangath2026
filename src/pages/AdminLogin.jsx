import { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, ArrowLeft, AlertTriangle } from 'lucide-react';
import { loginApi } from '../utils/api';
import './AdminLogin.css';

function AdminLogin({ setIsAdminLoggedIn, setCurrentPage, websiteContent }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError('');
    setShake(false);
    setLoading(true);

    try {
      await loginApi(username, password);
      setIsAdminLoggedIn(true);
      setCurrentPage('admin');
    } catch (err) {
      setError(err.message || 'Invalid username or password.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  }

  const brandName = websiteContent?.general?.logoText || "Sangath Global Exim";



  return (
    <div className="login-page">
      <div className={`login-card ${shake ? 'animate-shake' : ''}`}>
        
        <button className="btn-back-site" onClick={() => setCurrentPage('home')}>
          <ArrowLeft size={16} /> Back to Site
        </button>

        <div className="login-header">
          <h2>{brandName}</h2>
          <p>Portal Administration Gateway</p>
        </div>

        {error && (
          <div className="login-error">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group-login">
            <label htmlFor="login-username">Username</label>
            <div className="input-wrapper-login">
              <User size={18} className="input-icon" />
              <input 
                type="text" 
                id="login-username" 
                placeholder="Enter username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group-login">
            <label htmlFor="login-password">Password</label>
            <div className="input-wrapper-login">
              <Lock size={18} className="input-icon" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                id="login-password" 
                placeholder="Enter password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-login-submit" disabled={loading}>
            {loading ? <div className="login-spinner"></div> : "Authenticate Securely"}
          </button>
        </form>

      </div>
    </div>
  )
}

export default AdminLogin;

