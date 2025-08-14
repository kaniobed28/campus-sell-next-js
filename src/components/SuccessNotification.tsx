"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface SuccessNotificationProps {
  show: boolean;
  title: string;
  message: string;
  actionText?: string;
  actionHref?: string;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const SuccessNotification: React.FC<SuccessNotificationProps> = ({
  show,
  title,
  message,
  actionText,
  actionHref,
  onClose,
  autoClose = true,
  duration = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }
  }, [show, autoClose, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  if (!show) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="text-green-600 text-xl">✅</div>
          <div className="flex-1">
            <h3 className="font-semibold text-green-800 mb-1">{title}</h3>
            <p className="text-sm text-green-700 mb-3">{message}</p>
            
            <div className="flex items-center gap-2">
              {actionText && actionHref && (
                <Link
                  href={actionHref}
                  className="text-xs bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors"
                >
                  {actionText}
                </Link>
              )}
              <button
                onClick={handleClose}
                className="text-xs text-green-600 hover:text-green-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessNotification;