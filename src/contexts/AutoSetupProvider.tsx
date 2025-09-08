"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { autoSetupManager, SETUP_STATUS } from '@/lib/autoSetup';

interface AutoSetupContextType {
  isInitialized: boolean;
  isInitializing: boolean;
  progress: number;
  errors: any[];
  retrySetup: () => void;
}

const AutoSetupContext = createContext<AutoSetupContextType | undefined>(undefined);

export const useAutoSetup = () => {
  const context = useContext(AutoSetupContext);
  if (context === undefined) {
    throw new Error('useAutoSetup must be used within an AutoSetupProvider');
  }
  return context;
};

interface AutoSetupProviderProps {
  children: React.ReactNode;
}

export const AutoSetupProvider: React.FC<AutoSetupProviderProps> = ({ children }) => {
  const [setupStatus, setSetupStatus] = useState({
    isInitialized: false,
    isInitializing: true,
    progress: 0,
    errors: []
  });

  useEffect(() => {
    // Start automatic setup immediately when app loads
    initializeSystem();

    // Subscribe to setup progress updates
    const unsubscribe = autoSetupManager.onSetupProgress((progress) => {
      setSetupStatus({
        isInitialized: progress.isComplete,
        isInitializing: !progress.isComplete && progress.progress > 0,
        progress: progress.progress,
        errors: progress.errors
      });
    });

    return unsubscribe;
  }, []);

  const initializeSystem = async () => {
    try {
      console.log('🚀 Starting automatic system initialization...');
      await autoSetupManager.ensureSystemReady();
      console.log('✅ System initialization completed');
    } catch (error) {
      console.warn('⚠️ Setup completed with warnings:', error);
      // Don't throw error - system should continue with fallback data
    }
  };

  const retrySetup = () => {
    autoSetupManager.reset();
    initializeSystem();
  };

  const value: AutoSetupContextType = {
    isInitialized: setupStatus.isInitialized,
    isInitializing: setupStatus.isInitializing,
    progress: setupStatus.progress,
    errors: setupStatus.errors,
    retrySetup
  };

  return (
    <AutoSetupContext.Provider value={value}>
      {children}
    </AutoSetupContext.Provider>
  );
};

export default AutoSetupProvider;