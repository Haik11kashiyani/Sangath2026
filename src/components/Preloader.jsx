import React from 'react';
import logo from '../assets/logo.png';
import './Preloader.css';

function Preloader({ isExiting = false, brandName = "Sangath Global Exim", logoImage }) {
  const primaryName = brandName.split(' ')[0] || "Sangath";
  const secondaryName = brandName.split(' ').slice(1).join(' ') || "Global Exim";

  return (
    <div className={`sangath-preloader-overlay ${isExiting ? 'preloader-exit' : ''}`} aria-label="Loading Sangath Global Exim">
      {/* Background Animated Ambient Glowing Blobs */}
      <div className="preloader-ambient-blob blob-1"></div>
      <div className="preloader-ambient-blob blob-2"></div>
      <div className="preloader-ambient-blob blob-3"></div>

      {/* Center Frosted Glass Card */}
      <div className="preloader-glass-card">
        {/* Glowing Brand Logo with Pulse Rings */}
        <div className="preloader-logo-ring-container">
          <div className="preloader-pulse-ring ring-outer"></div>
          <div className="preloader-pulse-ring ring-middle"></div>
          <div className="preloader-pulse-ring ring-inner"></div>
          <div className="preloader-core-icon">
            <img 
              src={logoImage || logo} 
              alt={brandName} 
              className="preloader-logo-img" 
            />
          </div>
        </div>

        {/* Brand Typography */}
        <div className="preloader-text-group">
          <h1 className="preloader-brand-title">
            <span className="brand-gold-text">{primaryName}</span>{' '}
            <span className="brand-sub-text">{secondaryName}</span>
          </h1>
          <p className="preloader-tagline">Global Agricultural Commodities Trading</p>
        </div>

        {/* Sleek Progress Bar */}
        <div className="preloader-progress-container">
          <div className="preloader-progress-bar"></div>
        </div>

        {/* Subtle Status */}
        <div className="preloader-status">
          <span className="status-dot"></span>
          <span>Loading...</span>
        </div>
      </div>
    </div>
  );
}

export default Preloader;
