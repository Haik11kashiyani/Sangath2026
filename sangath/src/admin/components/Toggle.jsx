import React from 'react';

export default function Toggle({ checked, onChange, label, className = '' }) {
  return (
    <label 
      className={`sys-toggle-wrapper ${className}`} 
      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}
    >
      <div 
        className={`sys-toggle ${checked ? 'active' : ''}`}
        role="switch"
        aria-checked={checked}
        onClick={(e) => {
          e.preventDefault();
          onChange(!checked);
        }}
      >
        <div className="sys-toggle-track">
          <div className="sys-toggle-thumb" />
        </div>
      </div>
      {label && <span className="sys-toggle-label">{label}</span>}
    </label>
  );
}
