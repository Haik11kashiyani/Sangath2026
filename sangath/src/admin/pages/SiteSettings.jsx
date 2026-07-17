import React from 'react';

export function SiteSettings() {
  return (
    <div className="sys-settings-view">
      <header className="sys-header" style={{ marginBottom: '4rem' }}>
        <div className="sys-header-meta">SYS_CONFIG // PATH_PARAMETERS</div>
        <h1 className="sys-title">Settings</h1>
        <p className="sys-subtitle">Configure application environmental variables</p>
      </header>
      
      <form className="sys-form" style={{ maxWidth: '600px' }} onSubmit={(e) => e.preventDefault()}>
        <div className="sys-input-group">
          <label>PLATFORM_NAME</label>
          <input type="text" className="sys-input" defaultValue="Sangath Core Layout" />
        </div>
        <div className="sys-input-group">
          <label>INDEX_METADATA_STRING</label>
          <textarea className="sys-input" rows="4" style={{ resize: 'none' }} defaultValue="High-performance structural database entry interface." />
        </div>
        <button type="submit" className="sys-btn-primary" style={{ width: 'auto', padding: '1rem 3rem' }}>
          COMMIT_CHANGES
        </button>
      </form>
    </div>
  );
}