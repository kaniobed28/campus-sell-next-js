"use client";
import React, { useState, useEffect } from 'react';
import { adminSessionManager } from '@/lib/adminSessionManager';

const SessionTimeoutWarning = ({ onExtend, onSignOut }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const handleWarning = (timeRemaining) => {
      setRemainingTime(timeRemaining);
      setIsVisible(true);
    };

    const handleTimeout = () => {
      setIsVisible(false);
      if (onSignOut) {
        onSignOut();
      }
    };

    // Register callbacks
    adminSessionManager.onSessionWarning(handleWarning);
    adminSessionManager.onSessionTimeout(handleTimeout);

    return () => {
      // Cleanup callbacks
      adminSessionManager.removeCallback(handleWarning);
      adminSessionManager.removeCallback(handleTimeout);
    };
  }, [onSignOut]);

  useEffect(() => {
    if (isVisible && remainingTime > 0) {
      const interval = setInterval(() => {
        const remaining = adminSessionManager.getRemainingTime();
        setCountdown(remaining);
        
        if (remaining <= 0) {
          setIsVisible(false);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isVisible, remainingTime]);

  const handleExtendSession = () => {
    const extended = adminSessionManager.extendSession();
    if (extended) {
      setIsVisible(false);
      if (onExtend) {
        onExtend();
      }
    }
  };

  const handleSignOut = () => {
    setIsVisible(false);
    adminSessionManager.endSession();
    if (onSignOut) {
      onSignOut();
    }
  };

  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl p-6 max-w-md w-full mx-4 border border-border">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg 
              className="h-6 w-6 text-destructive" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-foreground">
              Session Expiring Soon
            </h3>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">
            Your admin session will expire in:
          </p>
          <div className="text-2xl font-bold text-destructive text-center">
            {formatTime(countdown)}
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-6">
          Would you like to extend your session or sign out now?
        </p>
        
        <div className="flex space-x-3">
          <button
            onClick={handleExtendSession}
            className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 font-medium transition-colors"
          >
            Extend Session
          </button>
          <button
            onClick={handleSignOut}
            className="flex-1 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 font-medium transition-colors"
          >
            Sign Out
          </button>
        </div>
        
        <div className="mt-4 text-xs text-muted-foreground text-center">
          Session will automatically end when timer reaches zero
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutWarning;