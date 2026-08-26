import React from 'react';
import { ShieldCheck } from 'lucide-react';
import './AdminPreloader.css';

function AdminPreloader({ 
  isExiting = false, 
  title = "Welcome to Sangath Team",
  subtitle = "Initializing Enterprise Administration & Secure Command Center..." 
}) {
  return (
    <div className={`sangath-admin-preloader-overlay ${isExiting ? 'admin-preloader-exit' : ''}`} aria-label="Loading Admin Portal">
      {/* Background Animated Executive Blobs */}
      <div className="admin-preloader-blob blob-gold"></div>
      <div className="admin-preloader-blob blob-emerald"></div>

      {/* Center Frosted Glass Card */}
      <div className="admin-preloader-glass-card">
        {/* Security Shield Icon with Glowing Radiance */}
        <div className="admin-preloader-icon-wrap">
          <div className="admin-pulse-orbit orbit-1"></div>
          <div className="admin-pulse-orbit orbit-2"></div>
          <div className="admin-shield-badge">
            <ShieldCheck size={36} className="admin-shield-svg" />
          </div>
        </div>

        {/* Title and Welcome Typography */}
        <div className="admin-preloader-text">
          <span className="admin-badge-tag">Verified Administrator</span>
          <h2 className="admin-welcome-heading">{title}</h2>
          <p className="admin-welcome-sub">{subtitle}</p>
        </div>

        {/* Progress Bar & Status */}
        <div className="admin-preloader-progress-box">
          <div className="admin-progress-track">
            <div className="admin-progress-fill"></div>
          </div>
          <div className="admin-preloader-meta">
            <span className="admin-status-indicator">
              <span className="admin-dot-live"></span>
              Secure Session Established
            </span>
            <span className="admin-status-text">Loading Modules...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPreloader;
