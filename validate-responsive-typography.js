#!/usr/bin/env node

/**
 * Validation script for responsive typography system
 * This script validates that all responsive typography classes are properly defined
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Responsive Typography System...\n');

// Read the global CSS file
const globalsCssPath = path.join(__dirname, 'src/app/globals.css');
const tokensPath = path.join(__dirname, 'src/styles/themes/tokens.js');
const hookPath = path.join(__dirname, 'src/hooks/useResponsiveTypography.js');
const docsPath = path.join(__dirname, 'RESPONSIVE_TYPOGRAPHY.md');

let errors = [];
let warnings = [];
let successes = [];

// Check if files exist
const requiredFiles = [
  { path: globalsCssPath, name: 'globals.css' },
  { path: tokensPath, name: 'tokens.js' },
  { path: hookPath, name: 'useResponsiveTypography.js' },
  { path: docsPath, name: 'RESPONSIVE_TYPOGRAPHY.md' }
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file.path)) {
    successes.push(`✅ ${file.name} exists`);
  } else {
    errors.push(`❌ ${file.name} is missing`);
  }
});

// Validate CSS classes
if (fs.existsSync(globalsCssPath)) {
  const cssContent = fs.readFileSync(globalsCssPath, 'utf8');
  
  // Check for display text classes
  const displayClasses = ['text-display-xl', 'text-display-lg', 'text-display-md'];
  displayClasses.forEach(className => {
    if (cssContent.includes(`.${className}`)) {
      successes.push(`✅ CSS class ${className} is defined`);
    } else {
      errors.push(`❌ CSS class ${className} is missing`);
    }
  });
  
  // Check for heading classes
  const headingClasses = ['text-heading-1', 'text-heading-2', 'text-heading-3', 'text-heading-4', 'text-heading-5', 'text-heading-6'];
  headingClasses.forEach(className => {
    if (cssContent.includes(`.${className}`)) {
      successes.push(`✅ CSS class ${className} is defined`);
    } else {
      errors.push(`❌ CSS class ${className} is missing`);
    }
  });
  
  // Check for body text classes
  const bodyClasses = ['text-body-xl', 'text-body-lg', 'text-body-base', 'text-body-sm', 'text-body-xs'];
  bodyClasses.forEach(className => {
    if (cssContent.includes(`.${className}`)) {
      successes.push(`✅ CSS class ${className} is defined`);
    } else {
      errors.push(`❌ CSS class ${className} is missing`);
    }
  });
  
  // Check for responsive breakpoints
  const breakpoints = ['@media (min-width: 768px)', '@media (min-width: 1024px)'];
  breakpoints.forEach(breakpoint => {
    if (cssContent.includes(breakpoint)) {
      successes.push(`✅ Responsive breakpoint ${breakpoint} is used`);
    } else {
      warnings.push(`⚠️  Responsive breakpoint ${breakpoint} might be missing`);
    }
  });
  
  // Check for utility classes
  const utilityClasses = [
    'leading-responsive-tight',
    'leading-responsive-normal',
    'tracking-responsive-tight',
    'tracking-responsive-normal',
    'text-caption',
    'text-label'
  ];
  
  utilityClasses.forEach(className => {
    if (cssContent.includes(`.${className}`)) {
      successes.push(`✅ Utility class ${className} is defined`);
    } else {
      errors.push(`❌ Utility class ${className} is missing`);
    }
  });
  
  // Check for accessibility features
  const accessibilityFeatures = [
    '@media (prefers-contrast: high)',
    'text-accessible-focus:focus'
  ];
  
  accessibilityFeatures.forEach(feature => {
    if (cssContent.includes(feature)) {
      successes.push(`✅ Accessibility feature ${feature} is implemented`);
    } else {
      warnings.push(`⚠️  Accessibility feature ${feature} might be missing`);
    }
  });
}

// Validate tokens file
if (fs.existsSync(tokensPath)) {
  const tokensContent = fs.readFileSync(tokensPath, 'utf8');
  
  // Check for responsive typography tokens
  if (tokensContent.includes('responsiveTypographyTokens')) {
    successes.push('✅ responsiveTypographyTokens is defined');
  } else {
    errors.push('❌ responsiveTypographyTokens is missing');
  }
  
  // Check for responsive font sizes
  if (tokensContent.includes('responsiveFontSizes')) {
    successes.push('✅ responsiveFontSizes configuration is defined');
  } else {
    errors.push('❌ responsiveFontSizes configuration is missing');
  }
  
  // Check for responsive line heights
  if (tokensContent.includes('responsiveLineHeights')) {
    successes.push('✅ responsiveLineHeights configuration is defined');
  } else {
    errors.push('❌ responsiveLineHeights configuration is missing');
  }
}

// Validate hook file
if (fs.existsSync(hookPath)) {
  const hookContent = fs.readFileSync(hookPath, 'utf8');
  
  // Check for main hook function
  if (hookContent.includes('export const useResponsiveTypography')) {
    successes.push('✅ useResponsiveTypography hook is exported');
  } else {
    errors.push('❌ useResponsiveTypography hook is missing');
  }
  
  // Check for key functions
  const keyFunctions = [
    'getResponsiveTextClass',
    'getResponsiveHeadingClass',
    'getResponsiveBodyClass',
    'getTypographyClasses'
  ];
  
  keyFunctions.forEach(func => {
    if (hookContent.includes(func)) {
      successes.push(`✅ Function ${func} is implemented`);
    } else {
      errors.push(`❌ Function ${func} is missing`);
    }
  });
  
  // Check for React components
  const components = ['ResponsiveText', 'ResponsiveHeading'];
  components.forEach(component => {
    if (hookContent.includes(`export const ${component}`)) {
      successes.push(`✅ Component ${component} is exported`);
    } else {
      errors.push(`❌ Component ${component} is missing`);
    }
  });
}

// Validate documentation
if (fs.existsSync(docsPath)) {
  const docsContent = fs.readFileSync(docsPath, 'utf8');
  
  // Check for key sections
  const keySections = [
    '## Typography Scales',
    '## Usage',
    '## Breakpoints',
    '## Accessibility Features',
    '## Best Practices'
  ];
  
  keySections.forEach(section => {
    if (docsContent.includes(section)) {
      successes.push(`✅ Documentation section "${section}" exists`);
    } else {
      warnings.push(`⚠️  Documentation section "${section}" might be missing`);
    }
  });
}

// Print results
console.log('📊 Validation Results:\n');

if (successes.length > 0) {
  console.log('✅ Successes:');
  successes.forEach(success => console.log(`   ${success}`));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  Warnings:');
  warnings.forEach(warning => console.log(`   ${warning}`));
  console.log('');
}

if (errors.length > 0) {
  console.log('❌ Errors:');
  errors.forEach(error => console.log(`   ${error}`));
  console.log('');
}

// Summary
console.log('📈 Summary:');
console.log(`   ✅ ${successes.length} checks passed`);
console.log(`   ⚠️  ${warnings.length} warnings`);
console.log(`   ❌ ${errors.length} errors`);

if (errors.length === 0) {
  console.log('\n🎉 Responsive Typography System validation completed successfully!');
  console.log('\n📚 Next steps:');
  console.log('   1. Update existing components to use responsive typography classes');
  console.log('   2. Test typography scaling across different viewport sizes');
  console.log('   3. Verify accessibility compliance with screen readers');
  console.log('   4. Run visual regression tests for typography changes');
} else {
  console.log('\n🚨 Validation failed. Please fix the errors above before proceeding.');
  process.exit(1);
}