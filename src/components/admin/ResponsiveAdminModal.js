"use client";

import React, { useEffect, useRef } from 'react';
import { useAdminResponsive } from '@/hooks/useAdminResponsive';

const ResponsiveAdminModal = ({
  isOpen = false,
  onClose,
  title,
  children,
  actions = null,
  size = 'default',
  className = ""
}) => {
  const { modalConfig, touchConfig } = useAdminResponsive();
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Store the previously focused element
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
    }
  }, [isOpen]);

  // Focus management and keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Tab') {
        handleTabNavigation(e);
      }
    };

    const handleTabNavigation = (e) => {
      if (!modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Focus the close button when modal opens
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
      
      // Return focus to previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getSizeClasses = () => {
    if (modalConfig.fullScreen) {
      return 'w-full h-full max-w-none max-h-none rounded-none';
    }

    const sizeMap = {
      sm: 'max-w-md',
      default: 'max-w-2xl',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl'
    };

    const maxWidth = modalConfig.maxWidth || sizeMap[size] || sizeMap.default;
    return `w-full ${maxWidth} max-h-[90vh] rounded-lg`;
  };

  const getPositionClasses = () => {
    if (modalConfig.fullScreen) {
      return 'inset-0';
    }

    switch (modalConfig.position) {
      case 'bottom':
        return 'bottom-0 left-0 right-0';
      case 'top':
        return 'top-0 left-0 right-0';
      default:
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
    }
  };

  const getAnimationClasses = () => {
    const baseClasses = 'transition-all duration-300 ease-out';
    
    switch (modalConfig.animation) {
      case 'slide-up':
        return `${baseClasses} ${isOpen ? 'translate-y-0' : 'translate-y-full'}`;
      case 'slide-down':
        return `${baseClasses} ${isOpen ? 'translate-y-0' : '-translate-y-full'}`;
      case 'fade-scale':
      default:
        return `${baseClasses} ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={`fixed ${getPositionClasses()} z-10`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          ref={modalRef}
          className={`
            bg-white shadow-xl ${getSizeClasses()} ${getAnimationClasses()} ${className}
            ${modalConfig.fullScreen ? '' : 'mx-4'}
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2
              id="modal-title"
              className="text-lg font-semibold text-gray-900 flex-1 mr-4"
            >
              {title}
            </h2>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className={`
                text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 
                focus:ring-primary focus:ring-offset-2 rounded-lg p-2
                transition-colors duration-200
              `}
              style={{
                minWidth: touchConfig.minTouchTarget,
                minHeight: touchConfig.minTouchTarget
              }}
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className={`
            ${modalConfig.fullScreen ? 'flex-1 overflow-y-auto' : 'max-h-[60vh] overflow-y-auto'}
            p-6
          `}>
            {children}
          </div>

          {/* Actions */}
          {actions && (
            <div className={`
              flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50
              ${modalConfig.fullScreen ? 'sticky bottom-0' : ''}
            `}>
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponsiveAdminModal;