"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';
import SuccessNotification from '@/components/SuccessNotification';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  actionText?: string;
  actionHref?: string;
  duration?: number;
}

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  showSuccess: (title: string, message: string, actionText?: string, actionHref?: string) => void;
  showError: (title: string, message: string) => void;
  showInfo: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showSuccess = (title: string, message: string, actionText?: string, actionHref?: string) => {
    showNotification({
      type: 'success',
      title,
      message,
      actionText,
      actionHref,
      duration: 5000,
    });
  };

  const showError = (title: string, message: string) => {
    showNotification({
      type: 'error',
      title,
      message,
      duration: 7000,
    });
  };

  const showInfo = (title: string, message: string) => {
    showNotification({
      type: 'info',
      title,
      message,
      duration: 4000,
    });
  };

  const showWarning = (title: string, message: string) => {
    showNotification({
      type: 'warning',
      title,
      message,
      duration: 6000,
    });
  };

  return (
    <NotificationContext.Provider value={{
      showNotification,
      showSuccess,
      showError,
      showInfo,
      showWarning,
    }}>
      {children}
      
      {/* Render notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <SuccessNotification
            key={notification.id}
            show={true}
            title={notification.title}
            message={notification.message}
            actionText={notification.actionText}
            actionHref={notification.actionHref}
            onClose={() => removeNotification(notification.id)}
            duration={notification.duration}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};