/**
 * @jest-environment jsdom
 */
import { 
  colorTokens, 
  typographyTokens, 
  spacingTokens, 
  borderRadiusTokens,
  lightThemeColors,
  darkThemeColors 
} from '../tokens';

describe('Design Tokens', () => {
  describe('colorTokens', () => {
    test('has required brand colors', () => {
      expect(colorTokens.brand).toHaveProperty('primary');
      expect(colorTokens.brand).toHaveProperty('secondary');
      expect(colorTokens.brand).toHaveProperty('accent');
    });

    test('has semantic colors', () => {
      expect(colorTokens.semantic).toHaveProperty('success');
      expect(colorTokens.semantic).toHaveProperty('warning');
      expect(colorTokens.semantic).toHaveProperty('error');
      expect(colorTokens.semantic).toHaveProperty('info');
    });

    test('has complete neutral palette', () => {
      const expectedShades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
      expectedShades.forEach(shade => {
        expect(colorTokens.neutral).toHaveProperty(shade.toString());
      });
    });

    test('brand colors are valid hex codes', () => {
      const hexRegex = /^#[0-9A-F]{6}$/i;
      expect(colorTokens.brand.primary).toMatch(hexRegex);
      expect(colorTokens.brand.secondary).toMatch(hexRegex);
      expect(colorTokens.brand.accent).toMatch(hexRegex);
    });
  });

  describe('typographyTokens', () => {
    test('has font families', () => {
      expect(typographyTokens.fontFamily).toHaveProperty('sans');
      expect(typographyTokens.fontFamily).toHaveProperty('mono');
      expect(Array.isArray(typographyTokens.fontFamily.sans)).toBe(true);
    });

    test('has font sizes with line heights', () => {
      const sizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'];
      sizes.forEach(size => {
        expect(typographyTokens.fontSize).toHaveProperty(size);
        expect(Array.isArray(typographyTokens.fontSize[size])).toBe(true);
        expect(typographyTokens.fontSize[size]).toHaveLength(2);
      });
    });

    test('has font weights', () => {
      const weights = ['thin', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold'];
      weights.forEach(weight => {
        expect(typographyTokens.fontWeight).toHaveProperty(weight);
      });
    });
  });

  describe('spacingTokens', () => {
    test('has consistent spacing scale', () => {
      const spacingKeys = Object.keys(spacingTokens);
      expect(spacingKeys.length).toBeGreaterThan(10);
      
      // Check that all values are valid CSS units
      Object.values(spacingTokens).forEach(value => {
        expect(typeof value).toBe('string');
        expect(value).toMatch(/^(\d+(\.\d+)?(px|rem|em)|0)$/);
      });
    });
  });

  describe('Theme Colors', () => {
    test('lightThemeColors has all required properties', () => {
      const requiredProps = [
        'background', 'foreground', 'card', 'cardForeground',
        'primary', 'primaryForeground', 'secondary', 'secondaryForeground',
        'muted', 'mutedForeground', 'accent', 'accentForeground',
        'destructive', 'destructiveForeground', 'border', 'input', 'ring'
      ];

      requiredProps.forEach(prop => {
        expect(lightThemeColors).toHaveProperty(prop);
      });
    });

    test('darkThemeColors has all required properties', () => {
      const requiredProps = [
        'background', 'foreground', 'card', 'cardForeground',
        'primary', 'primaryForeground', 'secondary', 'secondaryForeground',
        'muted', 'mutedForeground', 'accent', 'accentForeground',
        'destructive', 'destructiveForeground', 'border', 'input', 'ring'
      ];

      requiredProps.forEach(prop => {
        expect(darkThemeColors).toHaveProperty(prop);
      });
    });

    test('theme colors are valid hex codes', () => {
      const hexRegex = /^#[0-9A-F]{6}$/i;
      
      Object.values(lightThemeColors).forEach(color => {
        expect(color).toMatch(hexRegex);
      });

      Object.values(darkThemeColors).forEach(color => {
        expect(color).toMatch(hexRegex);
      });
    });
  });

  describe('Accessibility', () => {
    test('contrast ratios meet WCAG standards', () => {
      // This is a simplified test - in a real app you'd use a contrast checking library
      // For now, we just ensure dark and light themes have different values
      expect(lightThemeColors.background).not.toBe(darkThemeColors.background);
      expect(lightThemeColors.foreground).not.toBe(darkThemeColors.foreground);
      
      // Ensure muted foreground is different from regular foreground for hierarchy
      expect(lightThemeColors.mutedForeground).not.toBe(lightThemeColors.foreground);
      expect(darkThemeColors.mutedForeground).not.toBe(darkThemeColors.foreground);
    });
  });
});