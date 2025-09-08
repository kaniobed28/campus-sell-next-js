import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export const debugCategories = async () => {
  try {
    console.log('🔍 Debugging categories...');
    
    // Check Firebase connection
    console.log('📡 Checking Firebase connection...');
    const categoriesRef = collection(db, 'categories');
    
    // Get categories
    console.log('📂 Fetching categories...');
    const snapshot = await getDocs(categoriesRef);
    
    console.log('📊 Results:');
    console.log(`- Categories found: ${snapshot.size}`);
    
    if (snapshot.empty) {
      console.log('⚠️ No categories found in database');
      return { success: false, error: 'No categories found', count: 0 };
    }
    
    const categories = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      categories.push({
        id: doc.id,
        name: data.name,
        slug: data.slug,
        isActive: data.isActive,
        parentId: data.parentId || null
      });
    });
    
    console.log('📋 Categories:', categories);
    
    // Check for parent categories
    const parentCategories = categories.filter(cat => !cat.parentId);
    console.log(`👨‍👩‍👧‍👦 Parent categories: ${parentCategories.length}`);
    
    // Check for subcategories
    const subcategories = categories.filter(cat => cat.parentId);
    console.log(`👶 Subcategories: ${subcategories.length}`);
    
    return { 
      success: true, 
      count: categories.length,
      categories,
      parentCategories: parentCategories.length,
      subcategories: subcategories.length
    };
    
  } catch (error) {
    console.error('❌ Error debugging categories:', error);
    return { success: false, error: error.message, count: 0 };
  }
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  window.debugCategories = debugCategories;
}