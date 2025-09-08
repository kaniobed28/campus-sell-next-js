#!/usr/bin/env node

/**
 * Script to manually update category product counts
 * This script can be run directly with Node.js
 */

// Firebase configuration - replace with your actual config
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, writeBatch } from 'firebase/firestore';

// Replace with your Firebase config
const firebaseConfig = {
  // Add your Firebase configuration here
  // apiKey: "your-api-key",
  // authDomain: "your-auth-domain",
  // projectId: "your-project-id",
  // storageBucket: "your-storage-bucket",
  // messagingSenderId: "your-messaging-sender-id",
  // appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Product status constants
const PRODUCT_STATUS = {
  ACTIVE: 'active',
  BLOCKED: 'blocked',
  REMOVED: 'removed'
};

async function updateCategoryProductCounts() {
  try {
    console.log('Starting category product count synchronization...');

    // Get all categories
    const categoriesRef = collection(db, 'categories');
    const categoriesSnapshot = await getDocs(categoriesRef);
    
    console.log(`Found ${categoriesSnapshot.size} categories`);

    // Get all products
    const productsRef = collection(db, 'products');
    const productsSnapshot = await getDocs(productsRef);
    
    console.log(`Found ${productsSnapshot.size} products`);

    // Count active products per category
    const categoryProductCounts = new Map();

    console.log('Counting active products by category...');
    
    productsSnapshot.docs.forEach(doc => {
      const product = doc.data();
      // Only count active products
      if (product.status === PRODUCT_STATUS.ACTIVE && product.categoryId) {
        const currentCount = categoryProductCounts.get(product.categoryId) || 0;
        categoryProductCounts.set(product.categoryId, currentCount + 1);
      }
    });

    console.log(`Found products in ${categoryProductCounts.size} categories`);

    // Update categories with product counts
    console.log('Updating category product counts...');
    
    const batch = writeBatch(db);
    let updatedCount = 0;

    categoriesSnapshot.docs.forEach(doc => {
      const category = doc.data();
      const productCount = categoryProductCounts.get(category.id) || 0;

      batch.update(doc.ref, {
        'metadata.productCount': productCount,
        'metadata.updatedAt': new Date(),
      });
      
      updatedCount++;
    });

    await batch.commit();
    console.log(`Successfully updated ${updatedCount} categories!`);

    // Print summary
    console.log('\n--- Synchronization Summary ---');
    categoryProductCounts.forEach((count, categoryId) => {
      console.log(`Category ${categoryId}: ${count} active products`);
    });
    
    // Show categories with zero products
    const zeroCountCategories = [];
    categoriesSnapshot.docs.forEach(doc => {
      const category = doc.data();
      if (!categoryProductCounts.has(category.id) || categoryProductCounts.get(category.id) === 0) {
        zeroCountCategories.push(category.name);
      }
    });
    
    if (zeroCountCategories.length > 0) {
      console.log('\nCategories with 0 products:');
      zeroCountCategories.forEach(name => console.log(`- ${name}`));
    }

    console.log('\nCategory product count synchronization completed successfully!');
    
  } catch (error) {
    console.error('Error during category product count synchronization:', error);
    process.exit(1);
  }
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateCategoryProductCounts()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export { updateCategoryProductCounts };