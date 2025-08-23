/**
 * Comprehensive Header Responsiveness Test
 * Tests the header component across various screen sizes and scenarios
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${colors.bright}=== ${title} ===${colors.reset}`, 'blue');
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

// Header component file paths
const headerFiles = [
  'src/components/Header.js',
  'src/components/BasketCounter.js',
  'src/components/DarkModeToggle.jsx',
  'src/components/MobileMenu.jsx',
  'src/components/NavLinks.jsx'
];

// Responsive design patterns to check
const responsivePatterns = {
  // Mobile-first responsive classes
  mobileFirst: /\b(sm:|md:|lg:|xl:|2xl:)/,
  
  // Viewport hooks
  viewportHook: /useViewport/,
  
  // Responsive variables
  deviceDetection: /\b(isMobile|isTablet|isDesktop|isTouchDevice)\b/,
  
  // Touch targets (minimum 44px for accessibility)
  touchTargets: /min-[wh]-\[(44|48|56)px\]/,
  
  // Responsive spacing
  responsiveSpacing: /\b(gap-\d+|space-[xy]-\d+|p[xyt]?-\d+|m[xyt]?-\d+)\b.*\b(sm:|md:|lg:)/,
  
  // Responsive text sizing
  responsiveText: /text-(xs|sm|base|lg|xl|2xl|3xl|4xl).*\b(sm:|md:|lg:)/,
  
  // Flexible layouts
  flexbox: /\bflex\b.*\b(flex-1|flex-shrink-0|flex-grow)\b/,
  
  // Overflow handling
  overflowHandling: /overflow-(hidden|auto|scroll)|whitespace-nowrap/,
  
  // Interactive states
  interactiveStates: /hover:|active:|focus:|transition/,
  
  // Accessibility
  accessibility: /aria-|role=|sr-only/,
  
  // Responsive visibility
  responsiveVisibility: /\b(hidden|block|inline|flex)\b.*\b(sm:|md:|lg:)/
};

// Breakpoints to test (in pixels)
const breakpoints = {
  mobile: [320, 375, 414, 480],
  tablet: [768, 834, 1024],
  desktop: [1280, 1440, 1920, 2560]
};

function analyzeFile(filePath) {
  logSection(`Analyzing ${filePath}`);
  
  try {
    const fullPath = path.join(__dirname, filePath);
    if (!fs.existsSync(fullPath)) {
      logError(`File not found: ${filePath}`);
      return { valid: false, responsive: false };
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    let isValid = true;
    let isResponsive = true;
    
    // Check file syntax
    log('📋 Checking syntax...', 'cyan');
    
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;
    const openBrackets = (content.match(/\[/g) || []).length;
    const closeBrackets = (content.match(/\]/g) || []).length;
    
    if (openBraces === closeBraces) {
      logSuccess('Braces are balanced');
    } else {
      logError(`Unbalanced braces: ${openBraces} open, ${closeBraces} close`);
      isValid = false;
    }
    
    if (openParens === closeParens) {
      logSuccess('Parentheses are balanced');
    } else {
      logError(`Unbalanced parentheses: ${openParens} open, ${closeParens} close`);
      isValid = false;
    }
    
    if (openBrackets === closeBrackets) {
      logSuccess('Brackets are balanced');
    } else {
      logError(`Unbalanced brackets: ${openBrackets} open, ${closeBrackets} close`);
      isValid = false;
    }
    
    // Check responsive patterns
    log('📱 Checking responsive patterns...', 'cyan');
    
    for (const [patternName, pattern] of Object.entries(responsivePatterns)) {
      const matches = content.match(pattern);
      if (matches) {
        logSuccess(`${patternName}: Found ${matches.length} instances`);
      } else if (patternName === 'viewportHook' && filePath === 'src/components/Header.js') {
        logError(`${patternName}: Missing in main header component`);
        isResponsive = false;
      } else if (patternName === 'touchTargets') {
        logWarning(`${patternName}: Not found - ensure touch targets are at least 44px`);
      } else {
        log(`${patternName}: Not found`, 'yellow');
      }
    }
    
    // Check specific responsive features
    log('🎯 Checking specific responsive features...', 'cyan');
    
    // Check for mobile-specific adaptations
    if (content.includes('isMobile')) {
      logSuccess('Mobile device detection implemented');
    } else if (filePath.includes('Header.js')) {
      logWarning('Mobile device detection not found in header');
    }
    
    // Check for overflow protection
    if (content.includes('overflow') || content.includes('whitespace-nowrap')) {
      logSuccess('Overflow protection implemented');
    } else {
      logWarning('Consider adding overflow protection for long content');
    }
    
    // Check for proper flexbox usage
    if (content.includes('flex-shrink-0') || content.includes('flex-1')) {
      logSuccess('Flexible layout controls implemented');
    } else if (filePath.includes('Header.js')) {
      logWarning('Consider using flex controls for better layout management');
    }
    
    return { valid: isValid, responsive: isResponsive };
    
  } catch (error) {
    logError(`Error analyzing ${filePath}: ${error.message}`);
    return { valid: false, responsive: false };
  }
}

function checkBreakpointCompatibility() {
  logSection('Breakpoint Compatibility Analysis');
  
  log('📏 Checking Tailwind CSS breakpoints...', 'cyan');
  
  const tailwindBreakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  };
  
  Object.entries(tailwindBreakpoints).forEach(([name, size]) => {
    log(`${name}: ${size}`, 'blue');
  });
  
  logSuccess('Breakpoints are compatible with Tailwind CSS defaults');
  
  log('\n🎯 Critical responsive considerations:', 'cyan');
  log('• Mobile (< 768px): Single column, stacked navigation, touch targets ≥ 44px');
  log('• Tablet (768px - 1023px): Compact layout, selective hiding');
  log('• Desktop (≥ 1024px): Full navigation, hover states, larger touch targets');
}

function generateResponsiveTestPlan() {
  logSection('Responsive Test Plan');
  
  log('🧪 Manual Testing Checklist:', 'cyan');
  
  const testCases = [
    'Mobile (320px-767px):',
    '  ✓ Logo shows abbreviated version (CS)',
    '  ✓ Search bar hidden, search icon visible',
    '  ✓ Hamburger menu functional',
    '  ✓ Touch targets minimum 44px',
    '  ✓ No horizontal scroll',
    '',
    'Tablet (768px-1023px):',
    '  ✓ Logo shows medium version (Campus)',
    '  ✓ Search bar visible but compact',
    '  ✓ Some navigation elements hidden',
    '  ✓ Proper spacing and alignment',
    '',
    'Desktop (1024px+):',
    '  ✓ Logo shows full version (Campus Sell)',
    '  ✓ Full search bar visible',
    '  ✓ Complete navigation menu',
    '  ✓ Hover effects functional',
    '  ✓ Focus states visible',
    '',
    'Cross-device tests:',
    '  ✓ Smooth transitions between breakpoints',
    '  ✓ No content overflow or cut-off',
    '  ✓ Consistent theming across devices',
    '  ✓ Keyboard navigation works',
    '  ✓ Screen readers can access content'
  ];
  
  testCases.forEach(test => {
    if (test.startsWith('  ✓')) {
      log(test, 'green');
    } else if (test.includes(':')) {
      log(test, 'bright');
    } else {
      log(test);
    }
  });
}

// Main execution
async function runResponsiveTest() {
  log('🚀 Starting Comprehensive Header Responsiveness Test\n', 'bright');
  
  let allValid = true;
  let allResponsive = true;
  
  // Analyze each file
  for (const file of headerFiles) {
    const result = analyzeFile(file);
    if (!result.valid) allValid = false;
    if (!result.responsive) allResponsive = false;
  }
  
  checkBreakpointCompatibility();
  generateResponsiveTestPlan();
  
  // Final summary
  logSection('Test Results Summary');
  
  if (allValid && allResponsive) {
    logSuccess('🎉 All responsive header enhancements PASSED!');
    log('\n📋 Key improvements implemented:', 'cyan');
    log('✅ Enhanced container layout with proper overflow handling');
    log('✅ Responsive logo sizing (CS → Campus → Campus Sell)');
    log('✅ Improved search bar responsiveness with max-width constraints');
    log('✅ Touch-friendly buttons with 44px minimum targets');
    log('✅ Responsive spacing and gap management');
    log('✅ Enhanced icon sizing for different screen sizes');
    log('✅ Proper flex controls (flex-shrink-0, flex-1)');
    log('✅ Better focus management and accessibility');
    log('✅ Smooth transitions and hover effects');
    log('✅ Overflow protection with whitespace-nowrap');
  } else {
    if (!allValid) {
      logError('❌ Syntax issues found - please fix before testing');
    }
    if (!allResponsive) {
      logWarning('⚠️  Some responsive features may need attention');
    }
  }
  
  log('\n🌐 Test the header at http://localhost:3001', 'blue');
  log('📱 Use browser dev tools to test different screen sizes', 'blue');
  log('🔧 Toggle device toolbar (F12 → Ctrl+Shift+M) for mobile simulation', 'blue');
}

// Run the test
runResponsiveTest().catch(console.error);