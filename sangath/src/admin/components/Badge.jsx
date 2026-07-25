import React from 'react';

export default function Badge({ variant = 'info', children, className = '', ...props }) {
  const variantMap = {
    success: 'sys-badge-success',
    warning: 'sys-badge-warning', 
    danger: 'sys-badge-danger',
    info: 'sys-badge-info',
    purple: 'sys-badge-purple',
    muted: 'sys-badge-muted',
    primary: 'sys-badge-success',
    neutral: 'sys-badge-muted'
  };
  const variantClass = variantMap[variant] || 'sys-badge-info';
  return <span className={`sys-badge ${variantClass} ${className}`} {...props}>{children}</span>;
}
