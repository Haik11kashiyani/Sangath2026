import React from 'react';

export default function Badge({ variant = 'info', children, className = '' }) {
  return (
    <span className={`sys-badge sys-badge-${variant} ${className}`}>
      {children}
    </span>
  );
}
