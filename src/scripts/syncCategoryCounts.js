/**
 * Script to synchronize category product counts
 * This script will count all active products in each category and update the category metadata
 */

// Only run this script in server environment
if (typeof window !== 'undefined') {
  console.error('This script can only be run on the server side');
  process.exit(1);
}

async function syncCategoryCounts() {
  try {
    console.log('Starting category product count synchronization...');
    
    // Dynamically import Firebase modules
    const { db } = await import('@/lib/firebase');
    const { collection, getDocs, query, where, writeBatch } = await import('firebase/firestore');
    const { PRODUCT_STATUS } = await import('@/types/admin');

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
if (require.main === module) {
  syncCategoryCounts()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { syncCategoryCounts };