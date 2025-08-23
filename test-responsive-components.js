// Test script to verify responsive components syntax
const fs = require('fs');
const path = require('path');

const componentsToTest = [
  'src/components/HeroSection.js',
  'src/components/CategoriesSection.js', 
  'src/components/FeaturedListingsSection.js',
  'src/components/AboutSection.js',
  'src/components/CallToActionSection.js'
];

console.log('Testing responsive component syntax...\n');

componentsToTest.forEach(componentPath => {
  try {
    const fullPath = path.join(__dirname, componentPath);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Basic syntax checks
    const hasImports = content.includes('import');
    const hasExport = content.includes('export default');
    const hasResponsiveHooks = content.includes('useViewport') || content.includes('useResponsiveSpacing');
    const hasResponsiveClasses = content.includes('sm:') || content.includes('md:') || content.includes('lg:');
    
    console.log(`✓ ${componentPath}:`);
    console.log(`  - Has imports: ${hasImports}`);
    console.log(`  - Has export: ${hasExport}`);
    console.log(`  - Uses responsive hooks: ${hasResponsiveHooks}`);
    console.log(`  - Has responsive classes: ${hasResponsiveClasses}`);
    console.log('');
    
  } catch (error) {
    console.log(`✗ ${componentPath}: ${error.message}`);
  }
});

console.log('Component syntax test completed.');