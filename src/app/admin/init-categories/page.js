"use client";
import React, { useState } from 'react';
import { initializeCategories, resetCategories, updateCategoryProductCounts } from '@/scripts/initializeCategories.js';

const InitCategoriesPage = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleInitialize = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      await initializeCategories();
      setMessage('Categories initialized successfully!');
    } catch (err) {
      setError('Failed to initialize categories: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all categories? This will delete all existing categories.')) {
      return;
    }
    
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      await resetCategories();
      setMessage('Categories reset and reinitialized successfully!');
    } catch (err) {
      setError('Failed to reset categories: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCounts = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      await updateCategoryProductCounts();
      setMessage('Category product counts updated successfully!');
    } catch (err) {
      setError('Failed to update product counts: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Category Management
        </h1>
        <p className="text-muted-foreground">
          Initialize and manage product categories for the marketplace
        </p>
      </div>

      <div className="card-base rounded-xl p-6 space-y-6">
        {/* Initialize Categories */}
        <div className="border-b border-border pb-6">
          <h2 className="text-xl font-semibold mb-3">Initialize Categories</h2>
          <p className="text-muted-foreground mb-4">
            Set up the default category structure. This will only create categories if none exist.
          </p>
          <button
            onClick={handleInitialize}
            disabled={loading}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Initializing...' : 'Initialize Categories'}
          </button>
        </div>

        {/* Reset Categories */}
        <div className="border-b border-border pb-6">
          <h2 className="text-xl font-semibold mb-3">Reset Categories</h2>
          <p className="text-muted-foreground mb-4">
            <strong>Warning:</strong> This will delete all existing categories and recreate the default structure.
          </p>
          <button
            onClick={handleReset}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Categories'}
          </button>
        </div>

        {/* Update Product Counts */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Update Product Counts</h2>
          <p className="text-muted-foreground mb-4">
            Recalculate and update the product count for each category based on existing products.
          </p>
          <button
            onClick={handleUpdateCounts}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Product Counts'}
          </button>
        </div>

        {/* Messages */}
        {message && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">{message}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          After initializing categories, you can visit the{' '}
          <a href="/categories" className="text-primary hover:underline">
            categories page
          </a>{' '}
          to see them in action.
        </p>
      </div>
    </div>
  );
};

export default InitCategoriesPage;



