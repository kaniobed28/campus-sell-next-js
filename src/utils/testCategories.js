// Simple test utility to verify category system is working
export const testCategorySystem = () => {
  console.log('Testing category system...');
  
  // Test 1: Check if category structure is available
  try {
    const { defaultCategoryStructure } = require('@/data/categoryStructure.js');
    console.log('✅ Category structure loaded:', defaultCategoryStructure.length, 'categories');
  } catch (error) {
    console.error('❌ Failed to load category structure:', error);
  }
  
  // Test 2: Check if initialization functions are available
  try {
    const { initializeCategories } = require('@/scripts/initializeCategories.js');
    console.log('✅ Initialization functions loaded');
  } catch (error) {
    console.error('❌ Failed to load initialization functions:', error);
  }
  
  console.log('Category system test complete!');
};

// Auto-run test if in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.testCategorySystem = testCategorySystem;
}