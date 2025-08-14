/**
 * @jest-environment jsdom
 */
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useViewport, useBreakpoint, useResponsiveGrid, useResponsiveSpacing } from '../useViewport';

// Mock window dimensions
const mockWindowDimensions = (width, height = 768) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
};

// Mock touch device detection
const mockTouchDevice = (isTouchDevice = false) => {
  if (isTouchDevice) {
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      configurable: true,
      value: {},
    });
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: 5,
    });
  } else {
    delete window.ontouchstart;
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: 0,
    });
  }
};

describe('useViewport', () => {
  beforeEach(() => {
    // Reset to default desktop dimensions
    mockWindowDimensions(1024, 768);
    mockTouchDevice(false);
  });

  afterEach(() => {
    // Clean up event listeners
    jest.clearAllMocks();
  });

  test('initializes with correct desktop viewport', () => {
    mockWindowDimensions(1200, 800);
    const { result } = renderHook(() => useViewport());

    expect(result.current.width).toBe(1200);
    expect(result.current.height).toBe(800);
    expect(result.current.deviceType).toBe('desktop');
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
  });

  test('detects mobile viewport correctly', () => {
    mockWindowDimensions(375, 667);
    const { result } = renderHook(() => useViewport());

    expect(result.current.width).toBe(375);
    expect(result.current.deviceType).toBe('mobile');
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isSmallScreen).toBe(true);
  });

  test('detects tablet viewport correctly', () => {
    mockWindowDimensions(768, 1024);
    const { result } = renderHook(() => useViewport());

    expect(result.current.width).toBe(768);
    expect(result.current.deviceType).toBe('tablet');
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isMediumScreen).toBe(true);
  });

  test('responds to window resize events', () => {
    mockWindowDimensions(1200, 800);
    const { result } = renderHook(() => useViewport());

    expect(result.current.deviceType).toBe('desktop');

    // Simulate resize to mobile
    act(() => {
      mockWindowDimensions(375, 667);
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.width).toBe(375);
    expect(result.current.deviceType).toBe('mobile');
    expect(result.current.isMobile).toBe(true);
  });

  test('detects touch devices correctly', () => {
    mockTouchDevice(true);
    const { result } = renderHook(() => useViewport());

    expect(result.current.isTouchDevice).toBe(true);
  });

  test('detects non-touch devices correctly', () => {
    mockTouchDevice(false);
    const { result } = renderHook(() => useViewport());

    expect(result.current.isTouchDevice).toBe(false);
  });

  test('isDeviceType utility function works correctly', () => {
    mockWindowDimensions(375, 667);
    const { result } = renderHook(() => useViewport());

    expect(result.current.isDeviceType('mobile')).toBe(true);
    expect(result.current.isDeviceType('tablet')).toBe(false);
    expect(result.current.isDeviceType('desktop')).toBe(false);
  });

  test('provides responsive configuration access', () => {
    const { result } = renderHook(() => useViewport());

    expect(result.current.config).toBeDefined();
    expect(result.current.config.breakpoints).toBeDefined();
    expect(result.current.config.gridColumns).toBeDefined();
    expect(result.current.config.spacing).toBeDefined();
  });
});

describe('useBreakpoint', () => {
  test('detects xs breakpoint correctly', () => {
    mockWindowDimensions(320, 568);
    const { result } = renderHook(() => useBreakpoint());

    expect(result.current.xs).toBe(true);
    expect(result.current.sm).toBe(false);
    expect(result.current.md).toBe(false);
  });

  test('detects sm breakpoint correctly', () => {
    mockWindowDimensions(640, 480);
    const { result } = renderHook(() => useBreakpoint());

    expect(result.current.xs).toBe(false);
    expect(result.current.sm).toBe(true);
    expect(result.current.md).toBe(false);
  });

  test('detects md breakpoint correctly', () => {
    mockWindowDimensions(768, 1024);
    const { result } = renderHook(() => useBreakpoint());

    expect(result.current.sm).toBe(false);
    expect(result.current.md).toBe(true);
    expect(result.current.lg).toBe(false);
  });

  test('detects lg breakpoint correctly', () => {
    mockWindowDimensions(1024, 768);
    const { result } = renderHook(() => useBreakpoint());

    expect(result.current.md).toBe(false);
    expect(result.current.lg).toBe(true);
    expect(result.current.xl).toBe(false);
  });

  test('isAbove utility function works correctly', () => {
    mockWindowDimensions(1024, 768);
    const { result } = renderHook(() => useBreakpoint());

    expect(result.current.isAbove('md')).toBe(true);
    expect(result.current.isAbove('lg')).toBe(true);
    expect(result.current.isAbove('xl')).toBe(false);
  });

  test('isBelow utility function works correctly', () => {
    mockWindowDimensions(1024, 768);
    const { result } = renderHook(() => useBreakpoint());

    expect(result.current.isBelow('xl')).toBe(true);
    expect(result.current.isBelow('lg')).toBe(false);
    expect(result.current.isBelow('md')).toBe(false);
  });
});

describe('useResponsiveGrid', () => {
  test('returns correct columns for mobile', () => {
    mockWindowDimensions(375, 667);
    const { result } = renderHook(() => useResponsiveGrid());

    expect(result.current.columns).toBe(1);
    expect(result.current.deviceType).toBe('mobile');
    expect(result.current.gridCols).toBe('grid-cols-1');
  });

  test('returns correct columns for tablet', () => {
    mockWindowDimensions(768, 1024);
    const { result } = renderHook(() => useResponsiveGrid());

    expect(result.current.columns).toBe(2);
    expect(result.current.deviceType).toBe('tablet');
    expect(result.current.gridCols).toBe('grid-cols-2');
  });

  test('returns correct columns for desktop', () => {
    mockWindowDimensions(1200, 800);
    const { result } = renderHook(() => useResponsiveGrid());

    expect(result.current.columns).toBe(4);
    expect(result.current.deviceType).toBe('desktop');
    expect(result.current.gridCols).toBe('grid-cols-4');
  });

  test('handles specific content types correctly', () => {
    mockWindowDimensions(375, 667);
    const { result } = renderHook(() => useResponsiveGrid('categories'));

    expect(result.current.columns).toBe(2); // Categories have 2 columns on mobile
    expect(result.current.getColumns('products')).toBe(1); // Products have 1 column on mobile
  });

  test('provides Tailwind grid classes', () => {
    mockWindowDimensions(1200, 800);
    const { result } = renderHook(() => useResponsiveGrid());

    expect(result.current.gridCols).toBe('grid-cols-4');
    expect(result.current.smGridCols).toBe('sm:grid-cols-1');
    expect(result.current.mdGridCols).toBe('md:grid-cols-2');
    expect(result.current.lgGridCols).toBe('lg:grid-cols-4');
  });
});

describe('useResponsiveSpacing', () => {
  test('returns correct spacing for mobile', () => {
    mockWindowDimensions(375, 667);
    const { result } = renderHook(() => useResponsiveSpacing());

    expect(result.current.container).toBe('px-4');
    expect(result.current.gap).toBe('gap-4');
    expect(result.current.padding).toBe(16);
    expect(result.current.margin).toBe(16);
    expect(result.current.deviceType).toBe('mobile');
  });

  test('returns correct spacing for tablet', () => {
    mockWindowDimensions(768, 1024);
    const { result } = renderHook(() => useResponsiveSpacing());

    expect(result.current.container).toBe('px-6');
    expect(result.current.gap).toBe('gap-6');
    expect(result.current.padding).toBe(24);
    expect(result.current.margin).toBe(24);
    expect(result.current.deviceType).toBe('tablet');
  });

  test('returns correct spacing for desktop', () => {
    mockWindowDimensions(1200, 800);
    const { result } = renderHook(() => useResponsiveSpacing());

    expect(result.current.container).toBe('px-8');
    expect(result.current.gap).toBe('gap-8');
    expect(result.current.padding).toBe(32);
    expect(result.current.margin).toBe(32);
    expect(result.current.deviceType).toBe('desktop');
  });

  test('getSpacing utility function works correctly', () => {
    mockWindowDimensions(768, 1024);
    const { result } = renderHook(() => useResponsiveSpacing());

    expect(result.current.getSpacing('container')).toBe('px-6');
    expect(result.current.getSpacing('gap')).toBe('gap-6');
  });

  test('getTouchTarget returns minimum touch target size', () => {
    const { result } = renderHook(() => useResponsiveSpacing());

    expect(result.current.getTouchTarget()).toBe(44);
  });
});