"use client";
import React from 'react';
import { useAutoSetup } from '@/contexts/AutoSetupProvider';

const AutoSetupIndicator: React.FC = () => {
  const { isInitializing, progress, errors } = useAutoSetup();

  // Don't show anything if not initializing or if there are critical errors
  if (!isInitializing || errors.length > 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-center gap-3">
        <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full flex-shrink-0"></div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Setting up marketplace</p>
          <p className="text-xs text-muted-foreground">Configuring categories and system...</p>
          {progress > 0 && (
            <div className="mt-2">
              <div className="w-full bg-muted rounded-full h-1.5">
                <div 
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{progress}% complete</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutoSetupIndicator;