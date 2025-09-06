// Script to update category product counts
// This script uses CommonJS to avoid module issues

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, writeBatch } = require('firebase/firestore');

// Firebase configuration - replace with your actual config
const firebaseConfig = {
  // Add your Firebase config here
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

async function updateCategoryProductCounts() {
  try {
    console.log('Updating category product counts...');

    const categoriesRef = collection(db, 'categories');
    const productsRef = collection(db, 'products');

    const [categoriesSnapshot, productsSnapshot] = await Promise.all([
      getDocs(categoriesRef),
      getDocs(productsRef)
    ]);

    // Count products per category
    const categoryProductCounts = new Map();

    productsSnapshot.docs.forEach(doc => {
      const product = doc.data();
      const categoryId = product.categoryId || product.category; // Handle both old and new format

      if (categoryId && product.status === 'active') {
        const currentCount = categoryProductCounts.get(categoryId) || 0;
        categoryProductCounts.set(categoryId, currentCount + 1);
      }
    });

    // Update categories with product counts
    const batch = writeBatch(db);

    categoriesSnapshot.docs.forEach(doc => {
      const category = doc.data();
      const productCount = categoryProductCounts.get(category.id) || 0;

      batch.update(doc.ref, {
        'metadata.productCount': productCount,
        'metadata.updatedAt': new Date(),
      });
    });

    await batch.commit();
    console.log('Category product counts updated successfully!');
    
    // Print summary
    console.log('\nSummary:');
    categoryProductCounts.forEach((count, categoryId) => {
      console.log(`Category ${categoryId}: ${count} products`);
    });

  } catch (error) {
    console.error('Error updating category product counts:', error);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
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

module.exports = { updateCategoryProductCounts };