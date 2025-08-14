"use client";
import React, { useState, useEffect } from 'react';
import { debugCategories } from '@/utils/debugCategories.js';
import { initializeCategories } from '@/scripts/initializeCategories.js';
import useCategoryStore from '@/stores/useCategoryStore';

const DebugPage = () => {
  const [debugResult, setDebugResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { categories, fetchCategories } = useCategoryStore();

  const handleDebugCategories = async () => {
    setLoading(true);
    setMessage('');
    try {
      const result = await debugCategories();
      setDebugResult(result);
      setMessage(result.success ? 'Debug completed successfully' : 'Debug found issues');
    } catch (error) {
      setMessage('Debug failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeCategories = async () => {
    setLoading(true);
    setMessage('');
    try {
      const result = await initializeCategories();
      setMessage(`Initialization completed: ${result.message}`);
      // Refresh debug info
      await handleDebugCategories();
    } catch (error) {
      setMessage('Initialization failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchCategories = async () => {
    setLoading(true);
    setMessage('');
    try {
      await fetchCategories();
      setMessage(`Store fetch completed. Categories in store: ${categories.length}`);
      // Also refresh debug info
      setTimeout(() => {
        handleDebugCategories();
      }, 500);
    } catch (error) {
      setMessage('Store fetch failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-run debug on page load
    handleDebugCategories();
  }, []);

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          🔍 Category Debug Page
        </h1>
        <p className="text-muted-foreground">
          Debug and test the category system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={handleDebugCategories}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Debugging...' : 'Debug Categories'}
        </button>
        
        <button
          onClick={handleInitializeCategories}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Initializing...' : 'Initialize Categories'}
        </button>
        
        <button
          onClick={handleFetchCategories}
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Fetching...' : 'Test Store Fetch'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-6 ${
          message.includes('failed') || message.includes('issues')
            ? 'bg-red-50 border border-red-200 text-red-800'
            : 'bg-green-50 border border-green-200 text-green-800'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Debug Results */}
        <div className="card-base rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Database Debug Results</h2>
          {debugResult ? (
            <div className="space-y-2 text-sm">
              <div>Status: <span className={debugResult.success ? 'text-green-600' : 'text-red-600'}>
                {debugResult.success ? '✅ Success' : '❌ Failed'}
              </span></div>
              <div>Categories Found: <strong>{debugResult.count}</strong></div>
              {debugResult.parentCategories !== undefined && (
                <div>Parent Categories: <strong>{debugResult.parentCategories}</strong></div>
              )}
              {debugResult.subcategories !== undefined && (
                <div>Subcategories: <strong>{debugResult.subcategories}</strong></div>
              )}
              {debugResult.error && (
                <div className="text-red-600">Error: {debugResult.error}</div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Click "Debug Categories" to check database</p>
          )}
        </div>

        {/* Store State */}
        <div className="card-base rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Store State</h2>
          <div className="space-y-2 text-sm">
            <div>Categories in Store: <strong>{categories.length}</strong></div>
            <div>Store Status: <span className={categories.length > 0 ? 'text-green-600' : 'text-red-600'}>
              {categories.length > 0 ? '✅ Loaded' : '❌ Empty'}
            </span></div>
          </div>
          
          {categories.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Categories in Store:</h3>
              <div className="max-h-40 overflow-y-auto text-xs space-y-1">
                {categories.map((cat, index) => (
                  <div key={index} className="p-2 bg-muted rounded">
                    {cat.name} ({cat.slug})
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Raw Debug Data */}
      {debugResult && debugResult.categories && (
        <div className="mt-6 card-base rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Raw Database Data</h2>
          <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-60">
            {JSON.stringify(debugResult.categories, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Check the browser console for detailed logs
        </p>
      </div>
    </div>
  );
};

export default DebugPage;


