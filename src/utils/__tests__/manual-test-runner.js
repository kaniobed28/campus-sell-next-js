/**
 * Manual test runner for responsive utilities
 * This can be run in a browser console or Node.js environment
 */

// Import the utilities (adjust path as needed)
import { 
  responsiveConfig, 
  getDeviceType, 
  isDeviceType, 
  getResponsiveClasses, 
  getGridColumns 
} from '../responsiveConfig.js';

// Test results collector
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Simple assertion function
function assert(condition, message) {
  if (condition) {
    testResults.passed++;
    testResults.tests.push({ status: 'PASS', message });
    console.log(`✅ PASS: ${message}`);
  } else {
    testResults.failed++;
    testResults.tests.push({ status: 'FAIL', message });
    console.log(`❌ FAIL: ${message}`);
  }
}

// Test suite for responsiveConfig
console.log('🧪 Testing Responsive Configuration...\n');

// Test breakpoint definitions
assert(
  responsiveConfig.breakpoints.mobile.min === 320 && 
  responsiveConfig.breakpoints.mobile.max === 767,
  'Mobile breakpoints are correct'
);

assert(
  responsiveConfig.breakpoints.tablet.min === 768 && 
  responsiveConfig.breakpoints.tablet.max === 1023,
  'Tablet breakpoints are correct'
);

assert(
  responsiveConfig.breakpoints.desktop.min === 1024 && 
  responsiveConfig.breakpoints.desktop.max === Infinity,
  'Desktop breakpoints are correct'
);

// Test grid columns
assert(
  responsiveConfig.gridColumns.mobile === 1 &&
  responsiveConfig.gridColumns.tablet === 2 &&
  responsiveConfig.gridColumns.desktop === 4,
  'Default grid columns are correct'
);

assert(
  responsiveConfig.gridColumns.categories.mobile === 2 &&
  responsiveConfig.gridColumns.categories.tablet === 3 &&
  responsiveConfig.gridColumns.categories.desktop === 6,
  'Category grid columns are correct'
);

// Test spacing configurations
assert(
  responsiveConfig.spacing.mobile.container === 'px-4' &&
  responsiveConfig.spacing.tablet.container === 'px-6' &&
  responsiveConfig.spacing.desktop.container === 'px-8',
  'Container spacing classes are correct'
);

// Test getDeviceType function
assert(getDeviceType(375) === 'mobile', 'getDeviceType identifies mobile correctly');
assert(getDeviceType(768) === 'tablet', 'getDeviceType identifies tablet correctly');
assert(getDeviceType(1200) === 'desktop', 'getDeviceType identifies desktop correctly');

// Test edge cases
assert(getDeviceType(767) === 'mobile', 'getDeviceType handles mobile edge case');
assert(getDeviceType(1023) === 'tablet', 'getDeviceType handles tablet edge case');
assert(getDeviceType(1024) === 'desktop', 'getDeviceType handles desktop edge case');

// Test isDeviceType function
assert(isDeviceType(375, 'mobile') === true, 'isDeviceType correctly identifies mobile');
assert(isDeviceType(375, 'tablet') === false, 'isDeviceType correctly rejects tablet for mobile width');
assert(isDeviceType(768, 'tablet') === true, 'isDeviceType correctly identifies tablet');
assert(isDeviceType(1200, 'desktop') === true, 'isDeviceType correctly identifies desktop');

// Test getResponsiveClasses function
assert(getResponsiveClasses('mobile', 'container') === 'px-4', 'getResponsiveClasses returns correct mobile container class');
assert(getResponsiveClasses('tablet', 'gap') === 'gap-6', 'getResponsiveClasses returns correct tablet gap class');
assert(getResponsiveClasses('desktop', 'container') === 'px-8', 'getResponsiveClasses returns correct desktop container class');
assert(getResponsiveClasses('invalid', 'container') === '', 'getResponsiveClasses handles invalid device type');

// Test getGridColumns function
assert(getGridColumns('mobile') === 1, 'getGridColumns returns correct default mobile columns');
assert(getGridColumns('tablet') === 2, 'getGridColumns returns correct default tablet columns');
assert(getGridColumns('desktop') === 4, 'getGridColumns returns correct default desktop columns');
assert(getGridColumns('mobile', 'categories') === 2, 'getGridColumns returns correct mobile category columns');
assert(getGridColumns('tablet', 'categories') === 3, 'getGridColumns returns correct tablet category columns');
assert(getGridColumns('desktop', 'categories') === 6, 'getGridColumns returns correct desktop category columns');

// Test touch targets
assert(
  responsiveConfig.touchTargets.minimum === 44 &&
  responsiveConfig.touchTargets.recommended === 48 &&
  responsiveConfig.touchTargets.comfortable === 56,
  'Touch target sizes are correct'
);

// Test typography configurations
assert(
  responsiveConfig.typography.mobile.heading === 'text-2xl' &&
  responsiveConfig.typography.tablet.heading === 'text-3xl' &&
  responsiveConfig.typography.desktop.heading === 'text-4xl',
  'Typography heading sizes are correct'
);

// Print summary
console.log('\n📊 Test Summary:');
console.log(`✅ Passed: ${testResults.passed}`);
console.log(`❌ Failed: ${testResults.failed}`);
console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

if (testResults.failed === 0) {
  console.log('\n🎉 All tests passed! Responsive utilities are working correctly.');
} else {
  console.log('\n⚠️  Some tests failed. Please check the implementation.');
}

export { testResults };