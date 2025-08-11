/**
 * @jest-environment jsdom
 */
import {
  responsiveConfig,
  getDeviceType,
  isDeviceType,
  getResponsiveClasses,
  getGridColumns
} from '../responsiveConfig';

describe('responsiveConfig', () => {
  test('has correct breakpoint definitions', () => {
    expect(responsiveConfig.breakpoints).toEqual({
      mobile: { min: 320, max: 767 },
      tablet: { min: 768, max: 1023 },
      desktop: { min: 1024, max: Infinity }
    });
  });

  test('has correct Tailwind breakpoints', () => {
    expect(responsiveConfig.tailwindBreakpoints).toEqual({
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536
    });
  });

  test('has correct grid column configurations', () => {
    expect(responsiveConfig.gridColumns.mobile).toBe(1);
    expect(responsiveConfig.gridColumns.tablet).toBe(2);
    expect(responsiveConfig.gridColumns.desktop).toBe(4);
    
    expect(responsiveConfig.gridColumns.products.mobile).toBe(1);
    expect(responsiveConfig.gridColumns.products.tablet).toBe(2);
    expect(responsiveConfig.gridColumns.products.desktop).toBe(4);
    
    expect(responsiveConfig.gridColumns.categories.mobile).toBe(2);
    expect(responsiveConfig.gridColumns.categories.tablet).toBe(3);
    expect(responsiveConfig.gridColumns.categories.desktop).toBe(6);
  });

  test('has correct spacing configurations', () => {
    expect(responsiveConfig.spacing.mobile).toEqual({
      container: 'px-4',
      gap: 'gap-4',
      padding: 16,
      margin: 16
    });
    
    expect(responsiveConfig.spacing.tablet).toEqual({
      container: 'px-6',
      gap: 'gap-6',
      padding: 24,
      margin: 24
    });
    
    expect(responsiveConfig.spacing.desktop).toEqual({
      container: 'px-8',
      gap: 'gap-8',
      padding: 32,
      margin: 32
    });
  });

  test('has correct touch target sizes', () => {
    expect(responsiveConfig.touchTargets.minimum).toBe(44);
    expect(responsiveConfig.touchTargets.recommended).toBe(48);
    expect(responsiveConfig.touchTargets.comfortable).toBe(56);
  });

  test('has typography configurations for all device types', () => {
    expect(responsiveConfig.typography.mobile).toBeDefined();
    expect(responsiveConfig.typography.tablet).toBeDefined();
    expect(responsiveConfig.typography.desktop).toBeDefined();
    
    expect(responsiveConfig.typography.mobile.heading).toBe('text-2xl');
    expect(responsiveConfig.typography.tablet.heading).toBe('text-3xl');
    expect(responsiveConfig.typography.desktop.heading).toBe('text-4xl');
  });
});

describe('getDeviceType', () => {
  test('returns mobile for widths below 768px', () => {
    expect(getDeviceType(320)).toBe('mobile');
    expect(getDeviceType(375)).toBe('mobile');
    expect(getDeviceType(640)).toBe('mobile');
    expect(getDeviceType(767)).toBe('mobile');
  });

  test('returns tablet for widths between 768px and 1023px', () => {
    expect(getDeviceType(768)).toBe('tablet');
    expect(getDeviceType(800)).toBe('tablet');
    expect(getDeviceType(1000)).toBe('tablet');
    expect(getDeviceType(1023)).toBe('tablet');
  });

  test('returns desktop for widths 1024px and above', () => {
    expect(getDeviceType(1024)).toBe('desktop');
    expect(getDeviceType(1200)).toBe('desktop');
    expect(getDeviceType(1920)).toBe('desktop');
    expect(getDeviceType(2560)).toBe('desktop');
  });

  test('handles edge cases correctly', () => {
    expect(getDeviceType(0)).toBe('mobile');
    expect(getDeviceType(767.5)).toBe('mobile'); // Should round down
    expect(getDeviceType(1023.9)).toBe('tablet'); // Should round down
  });
});

describe('isDeviceType', () => {
  test('correctly identifies mobile devices', () => {
    expect(isDeviceType(375, 'mobile')).toBe(true);
    expect(isDeviceType(375, 'tablet')).toBe(false);
    expect(isDeviceType(375, 'desktop')).toBe(false);
  });

  test('correctly identifies tablet devices', () => {
    expect(isDeviceType(768, 'mobile')).toBe(false);
    expect(isDeviceType(768, 'tablet')).toBe(true);
    expect(isDeviceType(768, 'desktop')).toBe(false);
  });

  test('correctly identifies desktop devices', () => {
    expect(isDeviceType(1200, 'mobile')).toBe(false);
    expect(isDeviceType(1200, 'tablet')).toBe(false);
    expect(isDeviceType(1200, 'desktop')).toBe(true);
  });
});

describe('getResponsiveClasses', () => {
  test('returns correct classes for mobile', () => {
    expect(getResponsiveClasses('mobile', 'container')).toBe('px-4');
    expect(getResponsiveClasses('mobile', 'gap')).toBe('gap-4');
  });

  test('returns correct classes for tablet', () => {
    expect(getResponsiveClasses('tablet', 'container')).toBe('px-6');
    expect(getResponsiveClasses('tablet', 'gap')).toBe('gap-6');
  });

  test('returns correct classes for desktop', () => {
    expect(getResponsiveClasses('desktop', 'container')).toBe('px-8');
    expect(getResponsiveClasses('desktop', 'gap')).toBe('gap-8');
  });

  test('returns empty string for invalid device type', () => {
    expect(getResponsiveClasses('invalid', 'container')).toBe('');
  });

  test('returns empty string for invalid property', () => {
    expect(getResponsiveClasses('mobile', 'invalid')).toBe('');
  });
});

describe('getGridColumns', () => {
  test('returns default grid columns for each device type', () => {
    expect(getGridColumns('mobile')).toBe(1);
    expect(getGridColumns('tablet')).toBe(2);
    expect(getGridColumns('desktop')).toBe(4);
  });

  test('returns correct columns for products content type', () => {
    expect(getGridColumns('mobile', 'products')).toBe(1);
    expect(getGridColumns('tablet', 'products')).toBe(2);
    expect(getGridColumns('desktop', 'products')).toBe(4);
  });

  test('returns correct columns for categories content type', () => {
    expect(getGridColumns('mobile', 'categories')).toBe(2);
    expect(getGridColumns('tablet', 'categories')).toBe(3);
    expect(getGridColumns('desktop', 'categories')).toBe(6);
  });

  test('falls back to default for unknown content type', () => {
    expect(getGridColumns('mobile', 'unknown')).toBe(1);
    expect(getGridColumns('tablet', 'unknown')).toBe(2);
    expect(getGridColumns('desktop', 'unknown')).toBe(4);
  });

  test('handles invalid device types gracefully', () => {
    expect(getGridColumns('invalid')).toBeUndefined();
    expect(getGridColumns('invalid', 'products')).toBeUndefined();
  });
});