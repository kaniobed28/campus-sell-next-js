import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { PRODUCT_STATUS } from '@/types/admin';

export async function GET(request) {
  return handleSync(request);
}

export async function POST(request) {
  return handleSync(request);
}

async function handleSync(request) {
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

    // Prepare summary data
    const summary = [];
    categoryProductCounts.forEach((count, categoryId) => {
      summary.push({ categoryId, count });
    });
    
    // Categories with zero products
    const zeroCountCategories = [];
    categoriesSnapshot.docs.forEach(doc => {
      const category = doc.data();
      if (!categoryProductCounts.has(category.id) || categoryProductCounts.get(category.id) === 0) {
        zeroCountCategories.push({ id: category.id, name: category.name });
      }
    });

    const result = {
      success: true,
      message: `Successfully updated ${updatedCount} categories`,
      updatedCategories: updatedCount,
      summary,
      zeroCountCategories
    };

    console.log('\nCategory product count synchronization completed successfully!');
    
    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Error during category product count synchronization:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to synchronize category counts' 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}