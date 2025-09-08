import { renderHook } from '@testing-library/react';
import { useResponsiveTypography, ResponsiveText, ResponsiveHeading } from '../useResponsiveTypography';
import { useViewport } from '../useViewport';

// Mock the useViewport hook
jest.mock('../useViewport');

describe('useResponsiveTypography', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('getResponsiveTextClass', () => {
    it('should return correct class for valid scale', () => {
      useViewport.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isDesktop: true
      });

      const { result } = renderHook(() => useResponsiveTypography());
      
      expect(result.current.getResponsiveTextClass('heading-1')).toBe('text-heading-1');
      expect(result.current.getResponsiveTextClass('body-base')).toBe('text-body-base');
      expect(result.current.getResponsiveTextClass('display-xl')).toBe('text-display-xl');
    });

    it('should return fallback class for invalid scale', () => {
      useViewport.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isDesktop: true
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const { result } = renderHook(() => useResponsiveTypography());
      
      expect(result.current.getResponsiveTextClass('invalid-scale')).toBe('text-body-base');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid typography scale: invalid-scale. Using \'body-base\' as fallback.'
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('getResponsiveFontSize', () => {
    it('should return mobile font size when on mobile', () => {
      useViewport.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isDesktop: false
      });

      const { result } = renderHook(() => useResponsiveTypography());
      const fontSize = result.current.getResponsiveFontSize('heading-1');
      
      expect(fontSize.fontSize).toBe('1.5rem');
      expect(fontSize.lineHeight).toBe('2rem');
      expect(fontSize.letterSpacing).toBe('-0.025em');
    });

    it('should return tablet font size when on tablet', () => {
      useViewport.mockReturnValue({
        isMobile: false,
        isTablet: true,
        isDesktop: false
      });

      const { result } = renderHook(() => useResponsiveTypography());
      const fontSize = result.current.getResponsiveFontSize('heading-1');
      
      expect(fontSize.fontSize).toBe('1.875rem');
      expect(fontSize.lineHeight).toBe('2.25rem');
      expect(fontSize.letterSpacing).toBe('-0.025em');
    });

    it('should return desktop font size when on desktop', () => {
      useViewport.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isDesktop: true
      });

      const { result } = renderHook(() => useResponsiveTypography());
      const fontSize = result.current.getResponsiveFontSize('heading-1');
      
      expect(fontSize.fontSize).toBe('2.25rem');
      expect(fontSize.lineHeight).toBe('2.75rem');
      expect(fontSize.letterSpacing).toBe('-0.025em');
    });

    it('should return fallback for invalid scale', () => {
      useViewport.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isDesktop: true
      });

      const { result } = renderHook(() => useResponsiveTypography());
      const fontSize = result.current.getResponsiveFontSize('invalid-scale');
      
      expect(fontSize.fontSize).toBe('1rem');
      expect(fontSize.lineHeight).toBe('1.5rem');
      expect(fontSize.letterSpacing).toBe('0');
    });
  });

  describe('getResponsiveHeadingClass', () => {
    beforeEach(() => {
      useViewport.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isDesktop: true
      });
    });

    it('should return correct heading class for valid levels', () => {
      const { result } = renderHook(() => useResponsiveTypography());
      
      expect(result.current.getResponsiveHeadingClass(1)).toBe('text-heading-1');
      expect(result.current.getResponsiveHeadingClass(2)).toBe('text-heading-2');
      expect(result.current.getResponsiveHeadingClass(6)).toBe('text-heading-6');
    });

    it('should return display classes for display context', () => {
      const { result } = renderHook(() => useResponsiveTypography());
      
      expect(result.current.getResponsiveHeadingClass(1, 'display')).toBe('text-display-xl');
      expect(result.current.getResponsiveHeadingClass(2, 'display')).toBe('text-display-lg');
      expect(result.current.getResponsiveHeadingClass(3, 'display')).toBe('text-display-md');
    });

    it('should adjust heading level for card context', () => {
      const { result } = renderHook(() => useResponsiveTypography());
      
      expect(result.current.getResponsiveHeadingClass(1, 'card')).toBe('text-heading-2');
      expect(result.current.getResponsiveHeadingClass(5, 'card')).toBe('text-heading-6');
    });

    it('should handle invalid heading levels', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const { result } = renderHook(() => useResponsiveTypography());
      
      expect(result.current.getResponsiveHeadingClass(0)).toBe('text-heading-1');
      expect(result.current.getResponsiveHeadingClass(7)).toBe('text-heading-1');
      expect(consoleSpy).toHaveBeenCalledTimes(2);
      
      consoleSpy.mockRestore();
    });
  });

  describe('getResponsiveBodyClass', () => {
    beforeEach(() => {
      useViewport.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isDesktop: true
      });
    });

    it('should return correct body class for valid sizes', () => {
      const { result } = renderHook(() => useResponsiveTypography());
      
      expect(result.current.getResponsiveBodyClass('xs')).toBe('text-body-xs');
      expect(result.current.getResponsiveBodyClass('base')).toBe('text-body-base');
      expect(result.current.getResponsiveBodyClass('xl')).toBe('text-body-xl');
    });

    it('should return special classes for caption and label contexts', () => {
      const { result } = renderHook(() => useResponsiveTypography());
      
      expect(result.current.getResponsiveBodyClass('base', 'caption')).toBe('text-caption');
      expect(result.current.getResponsiveBodyClass('lg', 'label')).toBe('text-label');
    });

    it('should handle invalid sizes', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const { result } = renderHook(() => useResponsiveTypography());
      
      expect(result.current.getResponsiveBodyClass('invalid')).toBe('text-body-base');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid body text size: invalid. Using \'base\'.'
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('getResponsiveLineHeight', () => {
    beforeEach(() => {
      useViewport.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isDesktop: true
      });
    });

    it('should return correct line height classes', () => {
      const { result } = renderHook(() => useResponsiveTypography());
      
      expect(result.current.getResponsiveLineHeight('tight')).toBe('leading-responsive-tight');
      expect(result.current.getResponsiveLineHeight('normal')).toBe('leading-responsive-normal');
      expect(result.current.getResponsiveLineHeight('loose')).toBe('leading-responsive-loose');
    });

    it('should handle invalid spacing', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const { result } = renderHook(() => useResponsiveTypography());
      
      expect(result.current.getResponsiveLineHeight('invalid')).toBe('leading-responsive-normal');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid line height spacing: invalid. Using \'normal\'.'
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('getResponsiveLetterSpacing', () => {
    beforeEach(() => {
      useViewport.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isDesktop: true
      });
    });

    it('should return correct letter spacing classes', () => {
      const { result } = renderHook(() => useResponsiveTypography());
      
      expect(result.current.getResponsiveLetterSpacing('tight')).toBe('tracking-responsive-tight');
      expect(result.current.getResponsiveLetterSpacing('normal')).toBe('tracking-responsive-normal');
      expect(result.current.getResponsiveLetterSpacing('wide')).toBe('tracking-responsive-wide');
    });

    it('should handle invalid spacing', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const { result } = renderHook(() => useResponsiveTypography());
      
      expect(result.current.getResponsiveLetterSpacing('invalid')).toBe('tracking-responsive-normal');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid letter spacing: invalid. Using \'normal\'.'
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('getTypographyClasses', () => {
    beforeEach(() => {
      useViewport.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isDesktop: true
      });
    });

    it('should combine multiple typography classes', () => {
      const { result } = renderHook(() => useResponsiveTypography());
      
      const classes = result.current.getTypographyClasses({
        scale: 'heading-1',
        lineHeight: 'tight',
        letterSpacing: 'tight',
        alignment: 'center',
        weight: 'bold',
        color: 'responsive-accent'
      });
      
      expect(classes).toContain('text-heading-1');
      expect(classes).toContain('leading-responsive-tight');
      expect(classes).toContain('tracking-responsive-tight');
      expect(classes).toContain('text-center');
      expect(classes).toContain('font-bold');
      expect(classes).toContain('text-responsive-accent');
    });

    it('should use defaults when no options provided', () => {
      const { result } = renderHook(() => useResponsiveTypography());
      
      const classes = result.current.getTypographyClasses();
      
      expect(classes).toContain('text-body-base');
      expect(classes).toContain('leading-responsive-normal');
      expect(classes).toContain('tracking-responsive-normal');
      expect(classes).toContain('text-left');
      expect(classes).toContain('text-responsive-contrast');
    });
  });

  describe('getOptimalTextSize', () => {
    it('should return mobile size on mobile', () => {
      useViewport.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isDesktop: false
      });

      const { result } = renderHook(() => useResponsiveTypography());
      
      const size = result.current.getOptimalTextSize({
        mobile: 'body-sm',
        tablet: 'body-base',
        desktop: 'body-lg'
      });
      
      expect(size).toBe('text-body-sm');
    });

    it('should return tablet size on tablet', () => {
      useViewport.mockReturnValue({
        isMobile: false,
        isTablet: true,
        isDesktop: false
      });

      const { result } = renderHook(() => useResponsiveTypography());
      
      const size = result.current.getOptimalTextSize({
        mobile: 'body-sm',
        tablet: 'body-base',
        desktop: 'body-lg'
      });
      
      expect(size).toBe('text-body-base');
    });

    it('should return desktop size on desktop', () => {
      useViewport.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isDesktop: true
      });

      const { result } = renderHook(() => useResponsiveTypography());
      
      const size = result.current.getOptimalTextSize({
        mobile: 'body-sm',
        tablet: 'body-base',
        desktop: 'body-lg'
      });
      
      expect(size).toBe('text-body-lg');
    });

    it('should use defaults when no sizes provided', () => {
      useViewport.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isDesktop: false
      });

      const { result } = renderHook(() => useResponsiveTypography());
      
      const size = result.current.getOptimalTextSize();
      
      expect(size).toBe('text-body-sm');
    });
  });

  describe('currentViewport', () => {
    it('should return correct viewport string', () => {
      useViewport.mockReturnValue({
        isMobile: false,
        isTablet: true,
        isDesktop: false
      });

      const { result } = renderHook(() => useResponsiveTypography());
      
      expect(result.current.currentViewport).toBe('tablet');
      expect(result.current.isTablet).toBe(true);
      expect(result.current.isMobile).toBe(false);
      expect(result.current.isDesktop).toBe(false);
    });
  });
});

// Note: Component tests for ResponsiveText and ResponsiveHeading would require
// a more complex setup with React Testing Library and proper DOM rendering.
// These tests focus on the hook functionality which is the core of the system.