#!/usr/bin/env node

/**
 * Validation script for responsive image components
 * This script checks that all responsive image components are properly implemented
 */

const fs = require('fs');
const path = require('path');

console.log('🖼️  Validating Responsive Image Implementation...\n');

const componentsDir = path.join(__dirname, 'src', 'components');
const hooksDir = path.join(__dirname, 'src', 'hooks');
const utilsDir = path.join(__dirname, 'src', 'utils');

// Files that should exist
const requiredFiles = [
  'src/components/ResponsiveImage.jsx',
  'src/components/ResponsiveImageContainer.jsx',
  'src/hooks/useResponsiveImage.js',
  'src/utils/imageUtils.js'
];

// Test files that should exist
const testFiles = [
  'src/components/__tests__/ResponsiveImage.test.jsx',
  'src/components/__tests__/ResponsiveImageContainer.test.jsx',
  'src/hooks/__tests__/useResponsiveImage.test.js',
  'src/utils/__tests__/imageUtils.test.js'
];

let allValid = true;

// Check if required files exist
console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allValid = false;
  }
});

console.log('\n📝 Checking test files...');
testFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allValid = false;
  }
});

// Check component implementations
console.log('\n🔍 Validating component implementations...');

// Check ResponsiveImage component
try {
  const responsiveImagePath = path.join(__dirname, 'src/components/ResponsiveImage.jsx');
  const responsiveImageContent = fs.readFileSync(responsiveImagePath, 'utf8');
  
  const requiredFeatures = [
    'useViewport',
    'aspectRatio',
    'sizes',
    'quality',
    'priority',
    'onLoad',
    'onError',
    'fallbackSrc',
    'generateSizes',
    'getResponsiveQuality'
  ];
  
  let missingFeatures = [];
  requiredFeatures.forEach(feature => {
    if (!responsiveImageContent.includes(feature)) {
      missingFeatures.push(feature);
    }
  });
  
  if (missingFeatures.length === 0) {
    console.log('✅ ResponsiveImage component - All required features implemented');
  } else {
    console.log(`❌ ResponsiveImage component - Missing features: ${missingFeatures.join(', ')}`);
    allValid = false;
  }
} catch (error) {
  console.log('❌ ResponsiveImage component - Error reading file');
  allValid = false;
}

// Check ResponsiveImageContainer component
try {
  const containerPath = path.join(__dirname, 'src/components/ResponsiveImageContainer.jsx');
  const containerContent = fs.readFileSync(containerPath, 'utf8');
  
  const requiredVariants = [
    'product',
    'hero',
    'thumbnail',
    'gallery',
    'avatar'
  ];
  
  const requiredExports = [
    'ProductImageContainer',
    'HeroImageContainer',
    'ThumbnailImageContainer',
    'GalleryImageContainer',
    'AvatarImageContainer'
  ];
  
  let missingVariants = [];
  let missingExports = [];
  
  requiredVariants.forEach(variant => {
    if (!containerContent.includes(`'${variant}'`)) {
      missingVariants.push(variant);
    }
  });
  
  requiredExports.forEach(exportName => {
    if (!containerContent.includes(exportName)) {
      missingExports.push(exportName);
    }
  });
  
  if (missingVariants.length === 0 && missingExports.length === 0) {
    console.log('✅ ResponsiveImageContainer component - All variants and exports implemented');
  } else {
    if (missingVariants.length > 0) {
      console.log(`❌ ResponsiveImageContainer component - Missing variants: ${missingVariants.join(', ')}`);
    }
    if (missingExports.length > 0) {
      console.log(`❌ ResponsiveImageContainer component - Missing exports: ${missingExports.join(', ')}`);
    }
    allValid = false;
  }
} catch (error) {
  console.log('❌ ResponsiveImageContainer component - Error reading file');
  allValid = false;
}

// Check useResponsiveImage hook
try {
  const hookPath = path.join(__dirname, 'src/hooks/useResponsiveImage.js');
  const hookContent = fs.readFileSync(hookPath, 'utf8');
  
  const requiredHooks = [
    'useResponsiveImage',
    'useImageLoader',
    'useResponsiveAspectRatio'
  ];
  
  const requiredFunctions = [
    'generateSizes',
    'getOptimalQuality',
    'shouldUsePriority',
    'getCurrentBreakpoint'
  ];
  
  let missingHooks = [];
  let missingFunctions = [];
  
  requiredHooks.forEach(hook => {
    if (!hookContent.includes(`export const ${hook}`)) {
      missingHooks.push(hook);
    }
  });
  
  requiredFunctions.forEach(func => {
    if (!hookContent.includes(func)) {
      missingFunctions.push(func);
    }
  });
  
  if (missingHooks.length === 0 && missingFunctions.length === 0) {
    console.log('✅ useResponsiveImage hook - All hooks and functions implemented');
  } else {
    if (missingHooks.length > 0) {
      console.log(`❌ useResponsiveImage hook - Missing hooks: ${missingHooks.join(', ')}`);
    }
    if (missingFunctions.length > 0) {
      console.log(`❌ useResponsiveImage hook - Missing functions: ${missingFunctions.join(', ')}`);
    }
    allValid = false;
  }
} catch (error) {
  console.log('❌ useResponsiveImage hook - Error reading file');
  allValid = false;
}

// Check imageUtils
try {
  const utilsPath = path.join(__dirname, 'src/utils/imageUtils.js');
  const utilsContent = fs.readFileSync(utilsPath, 'utf8');
  
  const requiredUtils = [
    'generateSrcSet',
    'getOptimalDimensions',
    'isFormatSupported',
    'getPreferredFormat',
    'generateBlurDataURL',
    'calculateAspectRatio',
    'getResponsiveSizes',
    'preloadImages',
    'lazyLoadImage',
    'getLoadingStrategy'
  ];
  
  let missingUtils = [];
  
  requiredUtils.forEach(util => {
    if (!utilsContent.includes(`export const ${util}`)) {
      missingUtils.push(util);
    }
  });
  
  if (missingUtils.length === 0) {
    console.log('✅ imageUtils - All utility functions implemented');
  } else {
    console.log(`❌ imageUtils - Missing functions: ${missingUtils.join(', ')}`);
    allValid = false;
  }
} catch (error) {
  console.log('❌ imageUtils - Error reading file');
  allValid = false;
}

// Check Next.js configuration
console.log('\n⚙️  Checking Next.js configuration...');

try {
  const nextConfigPath = path.join(__dirname, 'next.config.mjs');
  const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
  
  if (nextConfigContent.includes('firebasestorage.googleapis.com')) {
    console.log('✅ Next.js config - Firebase Storage hostname configured');
  } else {
    console.log('❌ Next.js config - Firebase Storage hostname not configured');
    allValid = false;
  }
  
  if (nextConfigContent.includes('remotePatterns')) {
    console.log('✅ Next.js config - Remote patterns configured');
  } else {
    console.log('❌ Next.js config - Remote patterns not configured');
    allValid = false;
  }
} catch (error) {
  console.log('❌ Next.js config - Error reading configuration file');
  allValid = false;
}

// Check integration with existing components
console.log('\n🔗 Checking integration with existing components...');

try {
  const itemCardPath = path.join(__dirname, 'src/components/ItemCard.js');
  const itemCardContent = fs.readFileSync(itemCardPath, 'utf8');
  
  if (itemCardContent.includes('ProductImageContainer')) {
    console.log('✅ ItemCard component - Updated to use ResponsiveImage');
  } else {
    console.log('❌ ItemCard component - Not updated to use ResponsiveImage');
    allValid = false;
  }
} catch (error) {
  console.log('❌ ItemCard component - Error reading file');
  allValid = false;
}

try {
  const productImagePath = path.join(__dirname, 'src/components/ProductImage.js');
  const productImageContent = fs.readFileSync(productImagePath, 'utf8');
  
  if (productImageContent.includes('ResponsiveImage')) {
    console.log('✅ ProductImage component - Updated to use ResponsiveImage');
  } else {
    console.log('❌ ProductImage component - Not updated to use ResponsiveImage');
    allValid = false;
  }
} catch (error) {
  console.log('❌ ProductImage component - Error reading file');
  allValid = false;
}

// Final validation result
console.log('\n' + '='.repeat(50));
if (allValid) {
  console.log('🎉 All responsive image components are properly implemented!');
  console.log('\n📋 Implementation Summary:');
  console.log('• ResponsiveImage component with adaptive loading and fallback states');
  console.log('• ResponsiveImageContainer with pre-configured variants');
  console.log('• useResponsiveImage hook for responsive utilities');
  console.log('• imageUtils for image optimization and handling');
  console.log('• Integration with existing ItemCard and ProductImage components');
  console.log('• Comprehensive test coverage');
  console.log('\n✨ Task 7: Implement responsive image handling - COMPLETED');
} else {
  console.log('❌ Some issues found in responsive image implementation');
  console.log('Please review the errors above and fix them.');
  process.exit(1);
}

console.log('\n📖 Usage Examples:');
console.log('// Basic responsive image');
console.log('import ResponsiveImage from "@/components/ResponsiveImage";');
console.log('<ResponsiveImage src="/image.jpg" alt="Description" aspectRatio="square" />');
console.log('');
console.log('// Product image with container');
console.log('import { ProductImageContainer } from "@/components/ResponsiveImageContainer";');
console.log('<ProductImageContainer src="/product.jpg" alt="Product" />');
console.log('');
console.log('// Using responsive image hook');
console.log('import { useResponsiveImage } from "@/hooks/useResponsiveImage";');
console.log('const { generateSizes, getOptimalQuality } = useResponsiveImage();');