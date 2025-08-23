// Simple test to verify category structure
const { defaultCategoryStructure } = require('./src/data/categoryStructure.js');

console.log('Testing category structure...');
console.log('Type:', typeof defaultCategoryStructure);
console.log('Is Array:', Array.isArray(defaultCategoryStructure));
console.log('Length:', defaultCategoryStructure?.length);

if (defaultCategoryStructure && defaultCategoryStructure.length > 0) {
  console.log('First category:', defaultCategoryStructure[0]);
  console.log('Has slug:', !!defaultCategoryStructure[0]?.slug);
  
  // Check for any categories without slugs
  const categoriesWithoutSlugs = defaultCategoryStructure.filter(cat => !cat.slug);
  console.log('Categories without slugs:', categoriesWithoutSlugs.length);
  
  if (categoriesWithoutSlugs.length > 0) {
    console.log('Categories missing slugs:', categoriesWithoutSlugs);
  }
} else {
  console.log('No category data found!');
}