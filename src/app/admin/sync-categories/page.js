'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function SyncCategoriesPage() {
  const { isAdmin, loading } = useAdminAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSync = async () => {
    setIsSyncing(true);
    setResult(null);
    setError(null);
    
    try {
      const response = await fetch('/api/sync-category-counts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to sync category counts');
      }
    } catch (err) {
      setError(err.message || 'Failed to sync category counts');
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto-sync on page load for convenience
  useEffect(() => {
    if (isAdmin && !loading && !result && !error) {
      handleSync();
    }
  }, [isAdmin, loading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="text-center p-8 bg-card rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground">
            You must be an administrator to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-6">Category Count Synchronization</h1>
        
        <div className="bg-card rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Sync Category Product Counts</h2>
          <p className="text-muted-foreground mb-6">
            This tool will synchronize the product counts for all categories by counting the active products in each category.
          </p>
          
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              isSyncing 
                ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {isSyncing ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2 h-4 w-4 border-b-2 border-current rounded-full"></span>
                Synchronizing...
              </span>
            ) : (
              'Synchronize Category Counts'
            )}
          </button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-destructive mb-2">Error</h3>
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-success/10 border border-success/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-success mb-4">Synchronization Complete</h3>
            <p className="text-success mb-4">{result.message}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Summary</h4>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>Categories Updated:</span>
                    <span className="font-medium">{result.updatedCategories}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Categories with Products:</span>
                    <span className="font-medium">{result.summary.length}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Categories with Zero Products:</span>
                    <span className="font-medium">{result.zeroCountCategories.length}</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-2">Categories with Zero Products</h4>
                {result.zeroCountCategories.length > 0 ? (
                  <ul className="space-y-1 max-h-40 overflow-y-auto">
                    {result.zeroCountCategories.map((category) => (
                      <li key={category.id} className="text-sm text-muted-foreground">
                        {category.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">All categories have products</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}