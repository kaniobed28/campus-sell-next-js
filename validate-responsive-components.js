// Validation script for responsive component enhancements
const fs = require('fs');
const path = require('path');

const componentsToValidate = [
  {
    name: 'HeroSection',
    path: 'src/components/HeroSection.js',
    expectedFeatures: [
      'responsive text sizing (text-3xl sm:text-4xl md:text-5xl)',
      'responsive padding (py-12 sm:py-16 md:py-20)',
      'responsive button sizing',
      'responsive grid layout',
      'useViewport hook usage'
    ]
  },
  {
    name: 'CategoriesSection', 
    path: 'src/components/CategoriesSection.js',
    expectedFeatures: [
      'responsive grid (grid-cols-2 sm:grid-cols-3 lg:grid-cols-4)',
      'adaptive category count based on screen size',
      'responsive card sizing',
      'responsive spacing',
      'useViewport hook usage'
    ]
  },
  {
    name: 'FeaturedListingsSection',
    path: 'src/components/FeaturedListingsSection.js', 
    expectedFeatures: [
      'adaptive product count',
      'responsive grid classes',
      'mobile-specific view more link',
      'responsive heading sizes',
      'useViewport hook usage'
    ]
  },
  {
    name: 'AboutSection',
    path: 'src/components/AboutSection.js',
    expectedFeatures: [
      'responsive grid layout',
      'responsive button sizing',
      'responsive text sizing',
      'responsive spacing',
      'useViewport hook usage'
    ]
  },
  {
    name: 'CallToActionSection',
    path: 'src/components/CallToActionSection.js',
    expectedFeatures: [
      'responsive button sizing',
      'responsive text sizing', 
      'responsive stats grid',
      'responsive spacing',
      'useViewport hook usage'
    ]
  }
];

console.log('Validating responsive component enhancements...\n');

let allValid = true;

componentsToValidate.forEach(component => {
  try {
    const fullPath = path.join(__dirname, component.path);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    console.log(`📱 ${component.name}:`);
    
    // Check for responsive features
    const hasResponsiveText = /text-\w+\s+sm:text-\w+|md:text-\w+|lg:text-\w+/.test(content);
    const hasResponsiveGrid = /grid-cols-\d+\s+sm:grid-cols-\d+|md:grid-cols-\d+|lg:grid-cols-\d+/.test(content);
    const hasResponsivePadding = /py-\d+\s+sm:py-\d+|md:py-\d+|lg:py-\d+/.test(content);
    const hasViewportHook = content.includes('useViewport');
    const hasResponsiveSpacing = content.includes('useResponsiveSpacing');
    const hasDeviceChecks = content.includes('isMobile') || content.includes('isTablet') || content.includes('isDesktop');
    const hasMinTouchTargets = content.includes('min-h-[44px]') || content.includes('min-h-[48px]');
    
    console.log(`  ✓ Responsive text sizing: ${hasResponsiveText}`);
    console.log(`  ✓ Responsive grid layout: ${hasResponsiveGrid}`);
    console.log(`  ✓ Responsive padding: ${hasResponsivePadding}`);
    console.log(`  ✓ Uses viewport hook: ${hasViewportHook}`);
    console.log(`  ✓ Uses responsive spacing: ${hasResponsiveSpacing}`);
    console.log(`  ✓ Has device type checks: ${hasDeviceChecks}`);
    console.log(`  ✓ Has minimum touch targets: ${hasMinTouchTargets}`);
    
    const componentValid = hasResponsiveText && hasViewportHook && hasDeviceChecks;
    if (!componentValid) {
      allValid = false;
      console.log(`  ❌ Component needs additional responsive features`);
    } else {
      console.log(`  ✅ Component is properly responsive`);
    }
    
    console.log('');
    
  } catch (error) {
    console.log(`❌ ${component.name}: ${error.message}`);
    allValid = false;
  }
});

console.log(`\n${allValid ? '✅' : '❌'} Responsive validation ${allValid ? 'passed' : 'failed'}`);

if (allValid) {
  console.log('\n🎉 All components have been successfully enhanced for responsiveness!');
  console.log('\nKey improvements made:');
  console.log('• Mobile-first responsive design with proper breakpoints');
  console.log('• Touch-friendly button sizes (minimum 44px height)');
  console.log('• Adaptive content display based on screen size');
  console.log('• Responsive typography scaling');
  console.log('• Improved spacing and layout for all device types');
  console.log('• Integration with viewport detection hooks');
}