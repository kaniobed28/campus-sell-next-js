"use client";
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { initializeCategories } from '@/scripts/initializeCategories.js';
import { setupFirebaseStructure, validateFirebaseStructure } from '@/scripts/setupFirebaseStructure.js';
// import { useNotification } from '@/contexts/NotificationContext';

const SetupPage = () => {
  // Mock notification functions for debugging
  const showSuccess = (title, message) => {
    console.log('Success:', title, message);
    alert(`Success: ${title}\n${message}`);
  };
  const showError = (title, message) => {
    console.log('Error:', title, message);
    alert(`Error: ${title}\n${message}`);
  };
  const [status, setStatus] = useState({
    firebase: 'checking',
    structure: 'checking',
    categories: 'checking',
    products: 'checking',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    const newStatus = { ...status };

    try {
      // Check Firebase connection
      const categoriesRef = collection(db, 'categories');
      await getDocs(categoriesRef);
      newStatus.firebase = 'connected';

      // Validate Firebase structure
      try {
        const structureValidation = await validateFirebaseStructure();
        newStatus.structure = structureValidation.overall ? 'ready' : 'needs_setup';
      } catch (error) {
        newStatus.structure = 'needs_setup';
      }

      // Check categories
      const categoriesSnapshot = await getDocs(categoriesRef);
      newStatus.categories = categoriesSnapshot.empty ? 'empty' : 'ready';

      // Check products
      const productsRef = collection(db, 'products');
      const productsSnapshot = await getDocs(productsRef);
      newStatus.products = productsSnapshot.empty ? 'empty' : 'ready';

    } catch (error) {
      console.error('System check error:', error);
      newStatus.firebase = 'error';
      newStatus.structure = 'error';
      newStatus.categories = 'error';
      newStatus.products = 'error';
    }

    setStatus(newStatus);
  };

  const handleSetupFirebaseStructure = async () => {
    setLoading(true);
    setMessage('');

    try {
      await setupFirebaseStructure();
      setMessage('Firebase structure setup successfully!');
      showSuccess(
        'Database Structure Ready!',
        'Professional Firebase structure has been set up with all necessary collections and configurations.',
        'Continue Setup',
        '/setup'
      );
      await checkSystemStatus(); // Refresh status
    } catch (error) {
      const errorMessage = 'Error: ' + error.message;
      setMessage(errorMessage);
      showError('Structure Setup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeCategories = async () => {
    setLoading(true);
    setMessage('');

    try {
      await initializeCategories();
      setMessage('Categories initialized successfully!');
      showSuccess(
        'Categories Set Up Successfully!',
        'Your marketplace now has 9 main categories with 30+ subcategories ready for use.',
        'Browse Categories',
        '/categories'
      );
      await checkSystemStatus(); // Refresh status
    } catch (error) {
      const errorMessage = 'Error: ' + error.message;
      setMessage(errorMessage);
      showError('Setup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSetup = async () => {
    setLoading(true);
    setMessage('');

    try {
      console.log('Starting complete setup...');
      
      // Set up Firebase structure first
      console.log('Setting up Firebase structure...');
      await setupFirebaseStructure();
      console.log('Firebase structure setup complete');
      
      // Then initialize categories
      console.log('Initializing categories...');
      const result = await initializeCategories();
      console.log('Categories initialization result:', result);
      
      setMessage('Complete setup finished successfully!');
      showSuccess(
        'Marketplace Ready!',
        'Your campus marketplace is now fully set up and ready for users to start listing and buying products.'
      );
      await checkSystemStatus(); // Refresh status
    } catch (error) {
      console.error('Complete setup error:', error);
      const errorMessage = 'Error: ' + error.message;
      setMessage(errorMessage);
      showError('Complete Setup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (statusValue) => {
    switch (statusValue) {
      case 'checking': return '⏳';
      case 'connected':
      case 'ready': return '✅';
      case 'empty':
      case 'needs_setup': return '⚠️';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  const getStatusText = (statusValue) => {
    switch (statusValue) {
      case 'checking': return 'Checking...';
      case 'connected': return 'Connected';
      case 'ready': return 'Ready';
      case 'empty': return 'Empty';
      case 'needs_setup': return 'Needs Setup';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          System Setup
        </h1>
        <p className="text-muted-foreground">
          Check and initialize your campus marketplace system
        </p>
      </div>

      <div className="card-base rounded-xl p-6 space-y-6">
        {/* System Status */}
        <div>
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span>Firebase Connection</span>
              <span className="flex items-center gap-2">
                {getStatusIcon(status.firebase)}
                {getStatusText(status.firebase)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span>Database Structure</span>
              <span className="flex items-center gap-2">
                {getStatusIcon(status.structure)}
                {getStatusText(status.structure)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span>Categories</span>
              <span className="flex items-center gap-2">
                {getStatusIcon(status.categories)}
                {getStatusText(status.categories)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span>Products</span>
              <span className="flex items-center gap-2">
                {getStatusIcon(status.products)}
                {getStatusText(status.products)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>

          {status.categories === 'empty' && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Categories Not Set Up</h3>
              <p className="text-yellow-700 mb-3">
                Your marketplace needs categories to organize products. Click below to set up the default categories.
              </p>
              <button
                onClick={handleInitializeCategories}
                disabled={loading}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50"
              >
                {loading ? 'Setting up...' : 'Initialize Categories'}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/categories"
              className="p-4 border border-border rounded-lg hover:bg-muted transition-colors text-center"
            >
              <div className="text-2xl mb-2">📂</div>
              <div className="font-semibold">Browse Categories</div>
              <div className="text-sm text-muted-foreground">View all product categories</div>
            </a>

            <a
              href="/sell"
              className="p-4 border border-border rounded-lg hover:bg-muted transition-colors text-center"
            >
              <div className="text-2xl mb-2">💰</div>
              <div className="font-semibold">Sell Product</div>
              <div className="text-sm text-muted-foreground">List a new item for sale</div>
            </a>

            <a
              href="/admin/init-categories"
              className="p-4 border border-border rounded-lg hover:bg-muted transition-colors text-center"
            >
              <div className="text-2xl mb-2">⚙️</div>
              <div className="font-semibold">Admin Panel</div>
              <div className="text-sm text-muted-foreground">Advanced category management</div>
            </a>

            <button
              onClick={checkSystemStatus}
              className="p-4 border border-border rounded-lg hover:bg-muted transition-colors text-center"
            >
              <div className="text-2xl mb-2">🔄</div>
              <div className="font-semibold">Refresh Status</div>
              <div className="text-sm text-muted-foreground">Check system status again</div>
            </button>
          </div>

          {/* Complete Setup Button */}
          <div className="mt-6">
            <button
              onClick={handleCompleteSetup}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
            >
              {loading ? 'Setting up...' : 'Complete Setup'}
            </button>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              This will set up Firebase structure and initialize categories
            </p>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className={`p-4 rounded-lg ${message.includes('Error')
            ? 'bg-red-50 border border-red-200 text-red-800'
            : 'bg-green-50 border border-green-200 text-green-800'
            }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default SetupPage;



<<<<<<< HEAD

=======
>>>>>>> 9729b63 (bug space added 2 time)
