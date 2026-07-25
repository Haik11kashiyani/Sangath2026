import React, { useEffect, useRef } from 'react';

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md', 
  variant = 'default' 
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Prevent body scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="sys-modal-overlay" onClick={handleBackdropClick}>
      <div 
        className={`sys-modal sys-modal-${size} ${variant === 'danger' ? 'sys-modal-danger' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        ref={modalRef}
      >
        <div className="sys-modal-header">
          <h2 id="modal-title">{title}</h2>
          <button 
            type="button" 
            className="sys-modal-close" 
            onClick={onClose} 
            aria-label="Close modal"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="sys-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

// Modal Footer Compound Component
Modal.Footer = function ModalFooter({ children }) {
  return (
    <div className="sys-modal-footer">
      {children}
    </div>
  );
};
