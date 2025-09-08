import { db } from '@/lib/firebase';
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';

// Backup category structure in case import fails
const backupCategoryStructure = [
  {
    name: 'Electronics & Technology',
    slug: 'electronics-technology',
    description: 'Computers, phones, gadgets, and tech accessories',
    icon: '💻',
    displayOrder: 1,
    isActive: true,
  },
  {
    name: 'Fashion & Accessories',
    slug: 'fashion-accessories',
    description: 'Clothing, shoes, bags, and fashion accessories',
    icon: '👕',
    displayOrder: 2,
    isActive: true,
  },
  {
    name: 'Books & Education',
    slug: 'books-education',
    description: 'Textbooks, study materials, and educational resources',
    icon: '📚',
    displayOrder: 3,
    isActive: true,
  },
  {
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Furniture, appliances, and home essentials',
    icon: '🏠',
    displayOrder: 4,
    isActive: true,
  },
  {
    name: 'Sports & Recreation',
    slug: 'sports-recreation',
    description: 'Sports equipment, fitness gear, and recreational items',
    icon: '⚽',
    displayOrder: 5,
    isActive: true,
  }
];

/**
 * Initialize categories in Firebase Firestore
 * This script sets up the default category structure
 */
export async function initializeCategories() {
  try {
    console.log('Starting category initialization...');
    
    // Dynamic import to handle potential issues
    let categoryData;
    try {
      const categoryModule = await import('@/data/categoryStructure.js');
      categoryData = categoryModule.defaultCategoryStructure;
      console.log('Successfully imported full category structure');
    } catch (importError) {
      console.warn('Failed to import full category structure, using backup:', importError.message);
      categoryData = backupCategoryStructure;
    }
    
    console.log('categoryData type:', typeof categoryData);
    console.log('categoryData is array:', Array.isArray(categoryData));
    console.log('categoryData length:', categoryData?.length);
    
    // Log first few categories for debugging
    if (categoryData && categoryData.length > 0) {
      console.log('First category:', categoryData[0]);
      console.log('First category has slug:', !!categoryData[0]?.slug);
    }

    // Validate that we have category data
    if (!categoryData || !Array.isArray(categoryData) || categoryData.length === 0) {
      throw new Error('Category structure is not available or empty');
    }

    // Check if categories already exist
    const categoriesRef = collection(db, 'categories');
    const existingCategories = await getDocs(categoriesRef);

    // Check if we have the expected number of categories
    const expectedCount = categoryData.length;
    const currentCount = existingCategories.size;
    
    console.log(`Expected categories: ${expectedCount}, Current: ${currentCount}`);
    
    if (currentCount >= expectedCount) {
      console.log('Categories already exist and are complete. Skipping initialization.');
      return { success: true, message: 'Categories already initialized', count: currentCount };
    }
    
    if (currentCount > 0) {
      console.log('Partial categories found. Completing initialization...');
    }

    // Create a batch for atomic operations
    const batch = writeBatch(db);
    const categoryIdMap = new Map();

    // First pass: Create parent categories and generate IDs
    const parentCategories = categoryData.filter(cat => !cat.parentId);
    console.log('Parent categories found:', parentCategories.length);

    for (const categoryData of parentCategories) {
      console.log('Processing parent category:', categoryData);
      
      if (!categoryData || !categoryData.slug) {
        console.error('Invalid category data:', categoryData);
        throw new Error(`Invalid category data: missing slug property`);
      }
      
      const categoryRef = doc(categoriesRef);
      const categoryId = categoryRef.id;
      categoryIdMap.set(categoryData.slug, categoryId);

      const category = {
        id: categoryId,
        ...categoryData,
        metadata: {
          productCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'system',
        },
      };

      batch.set(categoryRef, category);
      console.log(`Prepared parent category: ${category.name}`);
    }

    // Second pass: Create subcategories with proper parent references
    const subcategories = categoryData.filter(cat => cat.parentId);

    for (const categoryData of subcategories) {
      const categoryRef = doc(categoriesRef);
      const categoryId = categoryRef.id;
      const parentId = categoryIdMap.get(categoryData.parentId);

      if (!parentId) {
        console.error(`Parent category not found for: ${categoryData.name}`);
        continue;
      }

      const category = {
        id: categoryId,
        ...categoryData,
        parentId,
        metadata: {
          productCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'system',
        },
      };

      batch.set(categoryRef, category);
      console.log(`Prepared subcategory: ${category.name} (parent: ${categoryData.parentId})`);
    }

    // Commit all categories at once
    await batch.commit();
    console.log('Successfully initialized all categories!');

    // Log summary
    const totalCategories = parentCategories.length + subcategories.length;
    console.log(`Total categories created: ${totalCategories}`);
    console.log(`Parent categories: ${parentCategories.length}`);
    console.log(`Subcategories: ${subcategories.length}`);

    return { 
      success: true, 
      message: 'Categories initialized successfully', 
      count: totalCategories,
      parentCategories: parentCategories.length,
      subcategories: subcategories.length
    };

  } catch (error) {
    console.error('Error initializing categories:', error);
    throw new Error(`Failed to initialize categories: ${error.message}`);
  }
}

/**
 * Reset categories - WARNING: This will delete all existing categories
 */
export async function resetCategories() {
  try {
    console.log('WARNING: Resetting all categories...');

    const categoriesRef = collection(db, 'categories');
    const existingCategories = await getDocs(categoriesRef);

    const batch = writeBatch(db);

    existingCategories.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log('All categories deleted.');

    // Now initialize fresh categories
    await initializeCategories();

  } catch (error) {
    console.error('Error resetting categories:', error);
    throw error;
  }
}

/**
 * Update category product counts
 */
export async function updateCategoryProductCounts() {
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

      if (categoryId) {
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

  } catch (error) {
    console.error('Error updating category product counts:', error);
    throw error;
  }
}

// Export for use in development/admin tools
if (typeof window === 'undefined') {
  // Only run in Node.js environment (not in browser)
  const args = process.argv.slice(2);

  if (args.includes('--init')) {
    initializeCategories().catch(console.error);
  } else if (args.includes('--reset')) {
    resetCategories().catch(console.error);
  } else if (args.includes('--update-counts')) {
    updateCategoryProductCounts().catch(console.error);
  }
}