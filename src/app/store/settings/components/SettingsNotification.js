import { useState, useEffect } from 'react';

const SettingsNotification = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const icon = type === 'success' ? '✅' : '❌';

  return (
    <div className={`fixed top-4 right-4 z-50 ${bgColor} border rounded-lg p-4 shadow-lg max-w-md`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="mr-2" aria-hidden="true">{icon}</span>
          <span className={textColor}>{message}</span>
        </div>
        <button
          onClick={onClose}
          className={`ml-4 ${textColor} hover:opacity-70`}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default SettingsNotification;