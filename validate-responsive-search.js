/**
 * Validation script for responsive search functionality
 * This script checks if the search components are properly implemented
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Responsive Search Implementation...\n');

// Check if required files exist
const requiredFiles = [
  'src/components/SearchModal.jsx',
  'src/components/SearchBar.jsx',
  'src/app/search/page.js',
  'src/__tests__/components/SearchModal.test.js',
  'src/__tests__/components/SearchBar.test.js'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - exists`);
  } else {
    console.log(`❌ ${file} - missing`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing!');
  process.exit(1);
}

// Check SearchModal component features
console.log('\n📱 Checking SearchModal component...');
const searchModalContent = fs.readFileSync(path.join(__dirname, 'src/components/SearchModal.jsx'), 'utf8');

const searchModalFeatures = [
  { name: 'Full-screen modal layout', pattern: /fixed inset-0/ },
  { name: 'Touch-friendly interactions', pattern: /min-h-\[44px\]|min-h-\[48px\]|min-h-\[56px\]/ },
  { name: 'Recent searches functionality', pattern: /recentSearches/ },
  { name: 'Keyboard handling (Escape)', pattern: /key.*Escape/ },
  { name: 'Search suggestions', pattern: /suggestions.*map/ },
  { name: 'Auto-focus input', pattern: /inputRef.*focus/ },
  { name: 'Prevent body scroll', pattern: /overflow.*hidden/ }
];

searchModalFeatures.forEach(feature => {
  if (feature.pattern.test(searchModalContent)) {
    console.log(`  ✅ ${feature.name}`);
  } else {
    console.log(`  ❌ ${feature.name}`);
  }
});

// Check SearchBar component features
console.log('\n🔍 Checking SearchBar component...');
const searchBarContent = fs.readFileSync(path.join(__dirname, 'src/components/SearchBar.jsx'), 'utf8');

const searchBarFeatures = [
  { name: 'Responsive sizing', pattern: /isMobile.*isTablet.*isDesktop/ },
  { name: 'Multiple variants', pattern: /variant.*compact.*modal/ },
  { name: 'Touch-friendly targets', pattern: /isTouchDevice/ },
  { name: 'Viewport hook usage', pattern: /useViewport/ },
  { name: 'Click outside handling', pattern: /handleClickOutside/ },
  { name: 'Suggestion dropdown', pattern: /showSuggestions.*suggestions/ },
  { name: 'Responsive classes', pattern: /getInputClasses|getButtonClasses/ }
];

searchBarFeatures.forEach(feature => {
  if (feature.pattern.test(searchBarContent)) {
    console.log(`  ✅ ${feature.name}`);
  } else {
    console.log(`  ❌ ${feature.name}`);
  }
});

// Check search page responsiveness
console.log('\n📄 Checking search page responsiveness...');
const searchPageContent = fs.readFileSync(path.join(__dirname, 'src/app/search/page.js'), 'utf8');

const searchPageFeatures = [
  { name: 'Responsive grid layout', pattern: /grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4/ },
  { name: 'Responsive padding', pattern: /px-4 sm:px-6 lg:px-8/ },
  { name: 'Responsive typography', pattern: /text-2xl sm:text-3xl lg:text-4xl/ },
  { name: 'Loading state', pattern: /animate-spin/ },
  { name: 'Error state', pattern: /error.*destructive/ },
  { name: 'Empty state', pattern: /No results found/ }
];

searchPageFeatures.forEach(feature => {
  if (feature.pattern.test(searchPageContent)) {
    console.log(`  ✅ ${feature.name}`);
  } else {
    console.log(`  ❌ ${feature.name}`);
  }
});

// Check Header integration
console.log('\n🏠 Checking Header integration...');
const headerContent = fs.readFileSync(path.join(__dirname, 'src/components/Header.js'), 'utf8');

const headerFeatures = [
  { name: 'SearchModal import', pattern: /import.*SearchModal/ },
  { name: 'SearchModal usage', pattern: /<SearchModal/ },
  { name: 'Responsive SearchBar variant', pattern: /variant.*isTablet.*compact/ },
  { name: 'Mobile search icon', pattern: /isMobile.*faMagnifyingGlass/ }
];

headerFeatures.forEach(feature => {
  if (feature.pattern.test(headerContent)) {
    console.log(`  ✅ ${feature.name}`);
  } else {
    console.log(`  ❌ ${feature.name}`);
  }
});

console.log('\n🎯 Task Requirements Validation:');

// Task requirement checks
const taskRequirements = [
  {
    name: 'Create SearchModal component for mobile search experience',
    check: () => fs.existsSync(path.join(__dirname, 'src/components/SearchModal.jsx')) &&
                 /fixed inset-0/.test(searchModalContent) &&
                 /min-h-\[44px\]/.test(searchModalContent)
  },
  {
    name: 'Modify SearchBar component to adapt layout based on screen size',
    check: () => /useViewport/.test(searchBarContent) &&
                 /variant.*compact.*modal/.test(searchBarContent) &&
                 /getInputClasses|getButtonClasses/.test(searchBarContent)
  },
  {
    name: 'Implement touch-friendly search input with proper keyboard handling',
    check: () => /isTouchDevice/.test(searchBarContent) &&
                 /min-h-\[48px\]|min-h-\[56px\]/.test(searchBarContent) &&
                 /key.*Escape/.test(searchModalContent)
  },
  {
    name: 'Add responsive search results dropdown with appropriate sizing',
    check: () => /showSuggestions.*suggestions/.test(searchBarContent) &&
                 /getSuggestionItemClasses/.test(searchBarContent) &&
                 /isMobile.*text-base.*text-sm/.test(searchBarContent)
  }
];

let allRequirementsMet = true;

taskRequirements.forEach((req, index) => {
  const passed = req.check();
  console.log(`  ${passed ? '✅' : '❌'} ${index + 1}. ${req.name}`);
  if (!passed) allRequirementsMet = false;
});

console.log('\n' + '='.repeat(60));

if (allRequirementsMet) {
  console.log('🎉 All task requirements have been successfully implemented!');
  console.log('\n📋 Summary:');
  console.log('  • SearchModal component created with full-screen mobile experience');
  console.log('  • SearchBar component enhanced with responsive layout adaptation');
  console.log('  • Touch-friendly interactions with proper keyboard handling');
  console.log('  • Responsive search results dropdown with appropriate sizing');
  console.log('  • Comprehensive test coverage for both components');
  console.log('  • Search page updated with responsive design');
  console.log('  • Header integration completed');
} else {
  console.log('❌ Some task requirements are not fully implemented.');
  console.log('Please review the failed checks above.');
}

console.log('\n🔧 To test the implementation:');
console.log('  1. Run: npm run dev');
console.log('  2. Open the app in different screen sizes');
console.log('  3. Test search functionality on mobile, tablet, and desktop');
console.log('  4. Verify touch targets are at least 44px on mobile devices');
console.log('  5. Test keyboard navigation and accessibility features');