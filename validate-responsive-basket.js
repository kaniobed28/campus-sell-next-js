#!/usr/bin/env node

/**
 * Validation script for responsive basket components
 * Tests responsive behavior, touch targets, and accessibility features
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${colors.bold}=== ${title} ===${colors.reset}`, 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// File paths to validate
const componentPaths = [
  'src/components/BasketItem.js',
  'src/components/BasketCounter.js',
  'src/components/AddToBasketButton.js',
  'src/components/SimpleAddToBasket.js',
  'src/components/ResponsiveBasketButton.js',
  'src/app/basket/page.js',
  'src/app/basket/checkout/page.js'
];

// Required responsive patterns
const responsivePatterns = {
  viewportHook: /useViewport/,
  typographyHook: /useResponsiveTypography/,
  mobileClasses: /isMobile/,
  touchDevice: /isTouchDevice/,
  touchTargets: /min-h-\[48px\]|min-h-\[44px\]/,
  responsiveSpacing: /px-\d+.*sm:px-\d+|py-\d+.*sm:py-\d+/,
  responsiveText: /getResponsiveTextClass|text-body-|text-heading-/,
  focusManagement: /focus:outline-none.*focus:ring-/,
  activeStates: /active:scale-/,
  ariaLabels: /aria-label|aria-/
};

// Accessibility requirements
const accessibilityPatterns = {
  altText: /alt=|aria-label=/,
  focusIndicators: /focus:ring-/,
  screenReaderText: /sr-only/,
  semanticHtml: /<(button|input|label|h[1-6])/,
  keyboardNavigation: /onKeyDown|tabIndex/
};

// Touch-friendly requirements
const touchRequirements = {
  minTouchTarget: /min-h-\[48px\]|min-h-\[44px\]/,
  touchFeedback: /active:scale-|hover:scale-/,
  touchDetection: /isTouchDevice/,
  appropriateSpacing: /gap-\d+|space-[xy]-\d+/
};

function validateFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    logError(`File not found: ${filePath}`);
    return { passed: 0, failed: 1, warnings: 0 };
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  let passed = 0, failed = 0, warnings = 0;

  log(`\nValidating: ${filePath}`, 'blue');

  // Check for responsive hooks
  if (responsivePatterns.viewportHook.test(content)) {
    logSuccess('Uses useViewport hook');
    passed++;
  } else {
    logWarning('Missing useViewport hook - may not be responsive');
    warnings++;
  }

  if (responsivePatterns.typographyHook.test(content)) {
    logSuccess('Uses responsive typography');
    passed++;
  } else {
    logWarning('Missing responsive typography');
    warnings++;
  }

  // Check for mobile-specific handling
  if (responsivePatterns.mobileClasses.test(content)) {
    logSuccess('Has mobile-specific classes');
    passed++;
  } else {
    logError('Missing mobile-specific responsive classes');
    failed++;
  }

  // Check for touch device handling
  if (responsivePatterns.touchDevice.test(content)) {
    logSuccess('Handles touch devices');
    passed++;
  } else {
    logWarning('Missing touch device detection');
    warnings++;
  }

  // Check for appropriate touch targets
  if (touchRequirements.minTouchTarget.test(content)) {
    logSuccess('Has appropriate touch target sizes');
    passed++;
  } else {
    logError('Missing minimum touch target sizes (44px/48px)');
    failed++;
  }

  // Check for focus management
  if (responsivePatterns.focusManagement.test(content)) {
    logSuccess('Has proper focus management');
    passed++;
  } else {
    logError('Missing focus management');
    failed++;
  }

  // Check for accessibility features
  if (accessibilityPatterns.screenReaderText.test(content)) {
    logSuccess('Has screen reader support');
    passed++;
  } else {
    logWarning('Missing screen reader text');
    warnings++;
  }

  // Check for ARIA labels
  if (accessibilityPatterns.altText.test(content)) {
    logSuccess('Has ARIA labels');
    passed++;
  } else {
    logWarning('Missing ARIA labels');
    warnings++;
  }

  // Check for touch feedback
  if (touchRequirements.touchFeedback.test(content)) {
    logSuccess('Has touch feedback animations');
    passed++;
  } else {
    logWarning('Missing touch feedback');
    warnings++;
  }

  return { passed, failed, warnings };
}

function validateResponsiveImages() {
  logSection('Responsive Images Integration');
  
  const basketItemPath = path.join(__dirname, 'src/components/BasketItem.js');
  
  if (!fs.existsSync(basketItemPath)) {
    logError('BasketItem.js not found');
    return { passed: 0, failed: 1, warnings: 0 };
  }

  const content = fs.readFileSync(basketItemPath, 'utf8');
  let passed = 0, failed = 0, warnings = 0;

  if (content.includes('ProductImageContainer')) {
    logSuccess('Uses responsive image container');
    passed++;
  } else {
    logError('Not using responsive image components');
    failed++;
  }

  if (content.includes('fallbackSrc')) {
    logSuccess('Has image fallback handling');
    passed++;
  } else {
    logWarning('Missing image fallback');
    warnings++;
  }

  return { passed, failed, warnings };
}

function validateBreakpointUsage() {
  logSection('Breakpoint Usage');
  
  let totalPassed = 0, totalFailed = 0, totalWarnings = 0;

  componentPaths.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) return;

    const content = fs.readFileSync(fullPath, 'utf8');
    let passed = 0, failed = 0, warnings = 0;

    // Check for responsive classes
    const responsiveClassPatterns = [
      /sm:/g,
      /md:/g,
      /lg:/g,
      /xl:/g
    ];

    const hasResponsiveClasses = responsiveClassPatterns.some(pattern => 
      pattern.test(content)
    );

    if (hasResponsiveClasses) {
      logSuccess(`${path.basename(filePath)}: Uses responsive breakpoints`);
      passed++;
    } else {
      logWarning(`${path.basename(filePath)}: Limited responsive breakpoint usage`);
      warnings++;
    }

    totalPassed += passed;
    totalFailed += failed;
    totalWarnings += warnings;
  });

  return { passed: totalPassed, failed: totalFailed, warnings: totalWarnings };
}

function validateTouchTargets() {
  logSection('Touch Target Validation');
  
  let totalPassed = 0, totalFailed = 0, totalWarnings = 0;

  componentPaths.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) return;

    const content = fs.readFileSync(fullPath, 'utf8');
    let passed = 0, failed = 0, warnings = 0;

    // Check for interactive elements
    const interactiveElements = content.match(/<button|<input|<select|<a.*href/g) || [];
    
    if (interactiveElements.length > 0) {
      // Check if touch targets are properly sized
      if (touchRequirements.minTouchTarget.test(content)) {
        logSuccess(`${path.basename(filePath)}: Interactive elements have proper touch targets`);
        passed++;
      } else {
        logError(`${path.basename(filePath)}: Interactive elements missing touch target sizing`);
        failed++;
      }

      // Check for touch feedback
      if (touchRequirements.touchFeedback.test(content)) {
        logSuccess(`${path.basename(filePath)}: Has touch feedback`);
        passed++;
      } else {
        logWarning(`${path.basename(filePath)}: Missing touch feedback`);
        warnings++;
      }
    }

    totalPassed += passed;
    totalFailed += failed;
    totalWarnings += warnings;
  });

  return { passed: totalPassed, failed: totalFailed, warnings: totalWarnings };
}

function generateReport(results) {
  logSection('Validation Report');
  
  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings, 0);
  const totalTests = totalPassed + totalFailed + totalWarnings;

  log(`\nTotal Tests: ${totalTests}`);
  logSuccess(`Passed: ${totalPassed}`);
  logError(`Failed: ${totalFailed}`);
  logWarning(`Warnings: ${totalWarnings}`);

  const passRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;
  log(`\nPass Rate: ${passRate}%`, passRate >= 80 ? 'green' : passRate >= 60 ? 'yellow' : 'red');

  if (totalFailed === 0) {
    logSuccess('\n🎉 All critical responsive basket requirements are met!');
  } else {
    logError(`\n❌ ${totalFailed} critical issues need to be addressed.`);
  }

  if (totalWarnings > 0) {
    logWarning(`\n⚠️  ${totalWarnings} improvements recommended for better responsive experience.`);
  }

  return { totalPassed, totalFailed, totalWarnings, passRate };
}

// Main validation function
function main() {
  log('🔍 Validating Responsive Basket Components', 'bold');
  log('==========================================\n');

  const results = [];

  // Validate individual components
  logSection('Component Validation');
  componentPaths.forEach(filePath => {
    const result = validateFile(filePath);
    results.push(result);
  });

  // Validate responsive images integration
  const imageResult = validateResponsiveImages();
  results.push(imageResult);

  // Validate breakpoint usage
  const breakpointResult = validateBreakpointUsage();
  results.push(breakpointResult);

  // Validate touch targets
  const touchResult = validateTouchTargets();
  results.push(touchResult);

  // Generate final report
  const report = generateReport(results);

  // Recommendations
  logSection('Recommendations');
  log('1. Ensure all interactive elements have minimum 48px touch targets');
  log('2. Test on actual mobile devices for touch feedback');
  log('3. Verify keyboard navigation works properly');
  log('4. Test with screen readers for accessibility');
  log('5. Validate responsive behavior at different viewport sizes');
  log('6. Consider adding haptic feedback for mobile interactions');

  return report.totalFailed === 0;
}

// Run validation
if (require.main === module) {
  const success = main();
  process.exit(success ? 0 : 1);
}

module.exports = { main, validateFile };