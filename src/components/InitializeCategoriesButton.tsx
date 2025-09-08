"use client";
import React, { useState } from 'react';
import { initializeCategories } from '@/scripts/initializeCategories.js';

interface InitializeCategoriesButtonProps {
  onSuccess?: () => void;
  className?: string;
  showNotification?: (title: string, message: string, actionText?: string, actionHref?: string) => void;
}

const InitializeCategoriesButton: React.FC<InitializeCategoriesButtonProps> = ({
  onSuccess,
  className = '',
  showNotification,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInitialize = async () => {
    setLoading(true);
    setError('');
    
    try {
      await initializeCategories();
      console.log('Categories initialized successfully!');
      
      // Clear the setup dismissed flag so banner can show again if needed
      localStorage.removeItem('system-setup-dismissed');
      
      // Show success notification
      if (showNotification) {
        showNotification(
          'Categories Set Up Successfully!',
          'Your marketplace now has 9 main categories with 30+ subcategories ready for use.',
          'Browse Categories',
          '/categories'
        );
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Failed to initialize categories:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize categories. Please try again.';
      setError(errorMessage);
      
      if (showNotification) {
        showNotification(
          'Setup Failed',
          errorMessage
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`text-center ${className}`}>
      <button
        onClick={handleInitialize}
        disabled={loading}
        className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Setting up categories...' : 'Set up Categories'}
      </button>
      
      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
      
      <p className="mt-2 text-sm text-muted-foreground">
        This will create the default category structure for the marketplace.
      </p>
    </div>
  );
};

export default InitializeCategoriesButton;