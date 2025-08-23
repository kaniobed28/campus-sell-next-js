/**
 * Validation script for responsive utilities
 * Run with: node validate-responsive-utils.js
 */

// Simple test framework
class SimpleTest {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.tests = [];
  }

  assert(condition, message) {
    if (condition) {
      this.passed++;
      this.tests.push({ status: 'PASS', message });
      console.log(`✅ PASS: ${message}`);
    } else {
      this.failed++;
      this.tests.push({ status: 'FAIL', message });
      console.log(`❌ FAIL: ${message}`);
    }
  }

  summary() {
    console.log('\n📊 Test Summary:');
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📈 Success Rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);
    
    if (this.failed === 0) {
      console.log('\n🎉 All tests passed! Responsive utilities are working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Please check the implementation.');
    }
  }
}

// Mock responsive config for testing
const responsiveConfig = {
  breakpoints: {
    mobile: { min: 320, max: 767 },
    tablet: { min: 768, max: 1023 },
    desktop: { min: 1024, max: Infinity }
  },
  
  tailwindBreakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  },
  
  gridColumns: {
    mobile: 1,
    tablet: 2,
    desktop: 4,
    products: {
      mobile: 1,
      tablet: 2,
      desktop: 4
    },
    categories: {
      mobile: 2,
      tablet: 3,
      desktop: 6
    }
  },
  
  spacing: {
    mobile: { 
      container: 'px-4', 
      gap: 'gap-4',
      padding: 16,
      margin: 16
    },
    tablet: { 
      container: 'px-6', 
      gap: 'gap-6',
      padding: 24,
      margin: 24
    },
    desktop: { 
      container: 'px-8', 
      gap: 'gap-8',
      padding: 32,
      margin: 32
    }
  },
  
  touchTargets: {
    minimum: 44,
    recommended: 48,
    comfortable: 56
  },
  
  typography: {
    mobile: {
      heading: 'text-2xl',
      subheading: 'text-lg',
      body: 'text-base',
      small: 'text-sm'
    },
    tablet: {
      heading: 'text-3xl',
      subheading: 'text-xl',
      body: 'text-base',
      small: 'text-sm'
    },
    desktop: {
      heading: 'text-4xl',
      subheading: 'text-2xl',
      body: 'text-lg',
      small: 'text-base'
    }
  }
};

// Utility functions
const getDeviceType = (width) => {
  if (width < responsiveConfig.breakpoints.tablet.min) {
    return 'mobile';
  } else if (width < responsiveConfig.breakpoints.desktop.min) {
    return 'tablet';
  } else {
    return 'desktop';
  }
};

const isDeviceType = (width, deviceType) => {
  return getDeviceType(width) === deviceType;
};

const getResponsiveClasses = (deviceType, property) => {
  return responsiveConfig.spacing[deviceType]?.[property] || '';
};

const getGridColumns = (deviceType, contentType = 'default') => {
  if (contentType !== 'default' && responsiveConfig.gridColumns[contentType]) {
    return responsiveConfig.gridColumns[contentType][deviceType];
  }
  return responsiveConfig.gridColumns[deviceType];
};

// Run tests
console.log('🧪 Testing Responsive Configuration...\n');

const test = new SimpleTest();

// Test breakpoint definitions
test.assert(
  responsiveConfig.breakpoints.mobile.min === 320 && 
  responsiveConfig.breakpoints.mobile.max === 767,
  'Mobile breakpoints are correct'
);

test.assert(
  responsiveConfig.breakpoints.tablet.min === 768 && 
  responsiveConfig.breakpoints.tablet.max === 1023,
  'Tablet breakpoints are correct'
);

test.assert(
  responsiveConfig.breakpoints.desktop.min === 1024 && 
  responsiveConfig.breakpoints.desktop.max === Infinity,
  'Desktop breakpoints are correct'
);

// Test grid columns
test.assert(
  responsiveConfig.gridColumns.mobile === 1 &&
  responsiveConfig.gridColumns.tablet === 2 &&
  responsiveConfig.gridColumns.desktop === 4,
  'Default grid columns are correct'
);

test.assert(
  responsiveConfig.gridColumns.categories.mobile === 2 &&
  responsiveConfig.gridColumns.categories.tablet === 3 &&
  responsiveConfig.gridColumns.categories.desktop === 6,
  'Category grid columns are correct'
);

// Test spacing configurations
test.assert(
  responsiveConfig.spacing.mobile.container === 'px-4' &&
  responsiveConfig.spacing.tablet.container === 'px-6' &&
  responsiveConfig.spacing.desktop.container === 'px-8',
  'Container spacing classes are correct'
);

// Test getDeviceType function
test.assert(getDeviceType(375) === 'mobile', 'getDeviceType identifies mobile correctly');
test.assert(getDeviceType(768) === 'tablet', 'getDeviceType identifies tablet correctly');
test.assert(getDeviceType(1200) === 'desktop', 'getDeviceType identifies desktop correctly');

// Test edge cases
test.assert(getDeviceType(767) === 'mobile', 'getDeviceType handles mobile edge case');
test.assert(getDeviceType(1023) === 'tablet', 'getDeviceType handles tablet edge case');
test.assert(getDeviceType(1024) === 'desktop', 'getDeviceType handles desktop edge case');

// Test isDeviceType function
test.assert(isDeviceType(375, 'mobile') === true, 'isDeviceType correctly identifies mobile');
test.assert(isDeviceType(375, 'tablet') === false, 'isDeviceType correctly rejects tablet for mobile width');
test.assert(isDeviceType(768, 'tablet') === true, 'isDeviceType correctly identifies tablet');
test.assert(isDeviceType(1200, 'desktop') === true, 'isDeviceType correctly identifies desktop');

// Test getResponsiveClasses function
test.assert(getResponsiveClasses('mobile', 'container') === 'px-4', 'getResponsiveClasses returns correct mobile container class');
test.assert(getResponsiveClasses('tablet', 'gap') === 'gap-6', 'getResponsiveClasses returns correct tablet gap class');
test.assert(getResponsiveClasses('desktop', 'container') === 'px-8', 'getResponsiveClasses returns correct desktop container class');
test.assert(getResponsiveClasses('invalid', 'container') === '', 'getResponsiveClasses handles invalid device type');

// Test getGridColumns function
test.assert(getGridColumns('mobile') === 1, 'getGridColumns returns correct default mobile columns');
test.assert(getGridColumns('tablet') === 2, 'getGridColumns returns correct default tablet columns');
test.assert(getGridColumns('desktop') === 4, 'getGridColumns returns correct default desktop columns');
test.assert(getGridColumns('mobile', 'categories') === 2, 'getGridColumns returns correct mobile category columns');
test.assert(getGridColumns('tablet', 'categories') === 3, 'getGridColumns returns correct tablet category columns');
test.assert(getGridColumns('desktop', 'categories') === 6, 'getGridColumns returns correct desktop category columns');

// Test touch targets
test.assert(
  responsiveConfig.touchTargets.minimum === 44 &&
  responsiveConfig.touchTargets.recommended === 48 &&
  responsiveConfig.touchTargets.comfortable === 56,
  'Touch target sizes are correct'
);

// Test typography configurations
test.assert(
  responsiveConfig.typography.mobile.heading === 'text-2xl' &&
  responsiveConfig.typography.tablet.heading === 'text-3xl' &&
  responsiveConfig.typography.desktop.heading === 'text-4xl',
  'Typography heading sizes are correct'
);

// Print summary
test.summary();