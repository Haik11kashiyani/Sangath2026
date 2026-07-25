import React from 'react';

export function SkeletonLoader({ type = 'card', count = 1, className = '' }) {
  const elements = Array.from({ length: count });

  if (type === 'table') {
    return (
      <div className={`sys-skeleton-elite ${className}`} style={{ height: '300px', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ height: '48px', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.01)' }} />
        {elements.slice(0, 5).map((_, i) => (
          <div key={i} style={{ height: '56px', borderBottom: '1px solid var(--border-subtle)' }} />
        ))}
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {elements.map((_, i) => (
          <div 
            key={i} 
            className={`sys-skeleton-elite ${className}`} 
            style={{ 
              height: '20px', 
              width: i === count - 1 && count > 1 ? '60%' : '100%',
              borderRadius: 'var(--radius-sm)'
            }} 
          />
        ))}
      </div>
    );
  }

  // Default: card
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
      {elements.map((_, i) => (
        <div key={i} className={`sys-skeleton-elite ${className}`} style={{ height: '160px', borderRadius: 'var(--radius-lg)' }} />
      ))}
    </div>
  );
}
