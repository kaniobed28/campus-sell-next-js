'use client';

import React from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import InitializeCategoriesButton from '@/components/InitializeCategoriesButton';
import { useNotification } from '@/contexts/NotificationContext';

const InitCategoriesPage = () => {
  const { isAdmin, loading } = useAdminAuth();
  const { showSuccess, showError } = useNotification();

  const handleSuccess = () => {
    showSuccess(
      'Categories Initialized',
      'The category structure has been successfully set up.',
      'View Categories',
      '/categories'
    );
  };

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
        <h1 className="text-3xl font-bold text-foreground mb-6">Category Initialization</h1>
        
        <div className="bg-card rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">About Category Initialization</h2>
          <p className="text-muted-foreground mb-4">
            This process will create the default category structure for the marketplace, 
            including 9 main categories with 30+ subcategories. This should only be done 
            once during initial setup.
          </p>
          
          <div className="bg-muted rounded-lg p-4 mb-6">
            <h3 className="font-medium mb-2">Category Structure:</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Electronics & Technology (Mobile Phones, Computers, Gaming, Audio & Video)</li>
              <li>Fashion & Accessories (Men's Clothing, Women's Clothing, Shoes, Bags)</li>
              <li>Books & Education (Textbooks, Study Materials, Reference Books)</li>
              <li>Home & Living (Furniture, Kitchen, Decor)</li>
              <li>Sports & Recreation (Fitness, Team Sports, Outdoor Activities)</li>
              <li>Food & Beverages (Snacks, Beverages, Meal Plans)</li>
              <li>Services (Tutoring, Tech Support, Transportation, Events)</li>
              <li>Vehicles & Transportation (Bicycles, Scooters, Car Accessories)</li>
              <li>Miscellaneous (Free Items, Lost & Found, Other)</li>
            </ul>
          </div>
          
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Initialize Categories</h3>
            <p className="text-muted-foreground mb-6">
              Click the button below to initialize the category structure. This process may take a few moments.
            </p>
            <InitializeCategoriesButton 
              onSuccess={handleSuccess}
              className="w-full sm:w-auto"
            />
          </div>
        </div>
        
        <div className="bg-info/10 border border-info/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-info mb-2">Important Notes</h3>
          <ul className="list-disc list-inside text-sm text-info space-y-1">
            <li>This process should only be performed once during initial setup</li>
            <li>Existing categories will not be affected if they already exist</li>
            <li>You can verify categories at any time in the <a href="/categories" className="underline hover:opacity-80">categories browser</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InitCategoriesPage;