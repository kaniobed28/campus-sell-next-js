/**
 * Manual test runner for responsive navigation system
 * Run this in the browser console to test navigation functionality
 */

const testResponsiveNavigation = () => {
  console.log('🧪 Testing Responsive Navigation System...');
  
  const tests = [];
  
  // Test 1: Check if mobile menu exists and has proper attributes
  const mobileMenuTest = () => {
    const hamburgerButton = document.querySelector('[aria-label*="navigation menu"]');
    const mobileMenu = document.querySelector('[role="dialog"]');
    
    if (hamburgerButton) {
      console.log('✅ Hamburger button found with proper aria-label');
      
      // Check touch target size
      const buttonRect = hamburgerButton.getBoundingClientRect();
      if (buttonRect.width >= 44 && buttonRect.height >= 44) {
        console.log('✅ Hamburger button meets minimum touch target size (44px)');
      } else {
        console.log('❌ Hamburger button too small:', buttonRect.width, 'x', buttonRect.height);
      }
    } else {
      console.log('❌ Hamburger button not found');
    }
    
    return hamburgerButton !== null;
  };
  
  // Test 2: Check navigation links have proper touch targets on mobile
  const touchTargetTest = () => {
    const navLinks = document.querySelectorAll('nav a, nav button');
    let passCount = 0;
    
    navLinks.forEach((link, index) => {
      const rect = link.getBoundingClientRect();
      const hasMinSize = rect.height >= 44;
      
      if (hasMinSize) {
        passCount++;
      } else {
        console.log(`❌ Link ${index} too small:`, rect.height, 'px height');
      }
    });
    
    if (passCount === navLinks.length) {
      console.log(`✅ All ${navLinks.length} navigation links meet touch target requirements`);
    } else {
      console.log(`⚠️ ${passCount}/${navLinks.length} navigation links meet touch target requirements`);
    }
    
    return passCount === navLinks.length;
  };
  
  // Test 3: Check hover states on desktop
  const hoverStateTest = () => {
    const navLinks = document.querySelectorAll('nav a');
    let hasHoverStates = 0;
    
    navLinks.forEach(link => {
      const computedStyle = window.getComputedStyle(link);
      const hasTransition = computedStyle.transition.includes('color') || 
                           computedStyle.transition.includes('all');
      
      if (hasTransition) {
        hasHoverStates++;
      }
    });
    
    if (hasHoverStates > 0) {
      console.log(`✅ ${hasHoverStates} navigation links have hover transitions`);
    } else {
      console.log('❌ No hover transitions found on navigation links');
    }
    
    return hasHoverStates > 0;
  };
  
  // Test 4: Check focus management
  const focusManagementTest = () => {
    const focusableElements = document.querySelectorAll(
      'nav button, nav a, nav input, nav select, nav textarea, nav [tabindex]:not([tabindex="-1"])'
    );
    
    let hasFocusStyles = 0;
    
    focusableElements.forEach(element => {
      const computedStyle = window.getComputedStyle(element);
      const hasFocusRing = element.classList.toString().includes('focus:') ||
                          computedStyle.outline !== 'none' ||
                          computedStyle.boxShadow.includes('ring');
      
      if (hasFocusRing) {
        hasFocusStyles++;
      }
    });
    
    if (hasFocusStyles > 0) {
      console.log(`✅ ${hasFocusStyles} focusable elements have focus styles`);
    } else {
      console.log('❌ No focus styles found on navigation elements');
    }
    
    return hasFocusStyles > 0;
  };
  
  // Test 5: Check responsive breakpoints
  const responsiveTest = () => {
    const viewport = window.innerWidth;
    const hamburgerButton = document.querySelector('[aria-label*="navigation menu"]');
    const desktopNav = document.querySelector('nav.hidden');
    
    if (viewport < 1024) {
      // Mobile/Tablet - should show hamburger
      if (hamburgerButton && !hamburgerButton.classList.contains('hidden')) {
        console.log('✅ Hamburger menu visible on mobile/tablet viewport');
        return true;
      } else {
        console.log('❌ Hamburger menu not visible on mobile/tablet viewport');
        return false;
      }
    } else {
      // Desktop - should show full nav
      if (desktopNav && !desktopNav.classList.contains('lg:hidden')) {
        console.log('✅ Desktop navigation visible on desktop viewport');
        return true;
      } else {
        console.log('❌ Desktop navigation not properly configured');
        return false;
      }
    }
  };
  
  // Run all tests
  tests.push({ name: 'Mobile Menu', test: mobileMenuTest });
  tests.push({ name: 'Touch Targets', test: touchTargetTest });
  tests.push({ name: 'Hover States', test: hoverStateTest });
  tests.push({ name: 'Focus Management', test: focusManagementTest });
  tests.push({ name: 'Responsive Breakpoints', test: responsiveTest });
  
  let passedTests = 0;
  
  tests.forEach(({ name, test }) => {
    console.log(`\n🔍 Running ${name} test...`);
    try {
      const result = test();
      if (result) {
        passedTests++;
        console.log(`✅ ${name} test passed`);
      } else {
        console.log(`❌ ${name} test failed`);
      }
    } catch (error) {
      console.log(`❌ ${name} test error:`, error.message);
    }
  });
  
  console.log(`\n📊 Test Results: ${passedTests}/${tests.length} tests passed`);
  
  if (passedTests === tests.length) {
    console.log('🎉 All responsive navigation tests passed!');
  } else {
    console.log('⚠️ Some tests failed. Check the implementation.');
  }
  
  return {
    passed: passedTests,
    total: tests.length,
    success: passedTests === tests.length
  };
};

// Test keyboard navigation
const testKeyboardNavigation = () => {
  console.log('\n⌨️ Testing Keyboard Navigation...');
  console.log('Manual steps to test:');
  console.log('1. Press Tab to navigate through menu items');
  console.log('2. Press Enter/Space to activate buttons');
  console.log('3. Press Escape to close mobile menu');
  console.log('4. Check focus indicators are visible');
  console.log('5. Verify focus trap in mobile menu');
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testResponsiveNavigation = testResponsiveNavigation;
  window.testKeyboardNavigation = testKeyboardNavigation;
  
  console.log('🔧 Responsive Navigation Test Suite loaded!');
  console.log('Run testResponsiveNavigation() to test the navigation system');
  console.log('Run testKeyboardNavigation() for keyboard navigation instructions');
}

export { testResponsiveNavigation, testKeyboardNavigation };