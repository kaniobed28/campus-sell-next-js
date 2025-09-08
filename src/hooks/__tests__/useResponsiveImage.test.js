import { renderHook, act } from '@testing-library/react';
import { useResponsiveImage, useImageLoader, useResponsiveAspectRatio } from '../useResponsiveImage';
import { useViewport } from '../useViewport';

// Mock the useViewport hook
jest.mock('../useViewport');

describe('useResponsiveImage', () => {
  const mockUseViewport = useViewport;

  beforeEach(() => {
    mockUseViewport.mockReturnValue({
      deviceType: 'desktop',
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      width: 1200
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('generates correct sizes for grid layout', () => {
    const { result } = renderHook(() => useResponsiveImage());
    
    const sizes = result.current.generateSizes('grid');
    expect(sizes).toBe('(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 25vw, 25vw');
  });

  it('generates correct sizes for hero layout', () => {
    const { result } = renderHook(() => useResponsiveImage());
    
    const sizes = result.current.generateSizes('hero');
    expect(sizes).toBe('100vw');
  });

  it('generates correct sizes for thumbnail layout', () => {
    const { result } = renderHook(() => useResponsiveImage());
    
    const sizes = result.current.generateSizes('thumbnail');
    expect(sizes).toBe('(max-width: 640px) 25vw, (max-width: 768px) 20vw, 15vw');
  });

  it('generates correct sizes for custom grid with columns', () => {
    const { result } = renderHook(() => useResponsiveImage());
    
    const sizes = result.current.generateSizes('grid', 3);
    expect(sizes).toBe('(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 33vw');
  });

  it('reduces quality for mobile devices', () => {
    mockUseViewport.mockReturnValue({
      deviceType: 'mobile',
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      width: 375
    });

    const { result } = renderHook(() => useResponsiveImage());
    
    const quality = result.current.getOptimalQuality(75);
    expect(quality).toBe(60); // 75 - 15 for mobile
  });

  it('reduces quality for tablet devices', () => {
    mockUseViewport.mockReturnValue({
      deviceType: 'tablet',
      isMobile: false,
      isTablet: true,
      isDesktop: false,
      width: 768
    });

    const { result } = renderHook(() => useResponsiveImage());
    
    const quality = result.current.getOptimalQuality(75);
    expect(quality).toBe(65); // 75 - 10 for tablet
  });

  it('maintains quality for desktop devices', () => {
    const { result } = renderHook(() => useResponsiveImage());
    
    const quality = result.current.getOptimalQuality(75);
    expect(quality).toBe(75); // No reduction for desktop
  });

  it('determines priority loading correctly', () => {
    const { result } = renderHook(() => useResponsiveImage());
    
    // Hero images should always have priority
    expect(result.current.shouldUsePriority(false, true)).toBe(true);
    
    // Above fold images on desktop should have priority
    expect(result.current.shouldUsePriority(true, false)).toBe(true);
    
    // Below fold, non-hero images should not have priority
    expect(result.current.shouldUsePriority(false, false)).toBe(false);
  });

  it('determines priority loading for mobile correctly', () => {
    mockUseViewport.mockReturnValue({
      deviceType: 'mobile',
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      width: 375
    });

    const { result } = renderHook(() => useResponsiveImage());
    
    // Above fold images on mobile should not have priority (unless hero)
    expect(result.current.shouldUsePriority(true, false)).toBe(false);
    
    // Hero images should still have priority on mobile
    expect(result.current.shouldUsePriority(false, true)).toBe(true);
  });

  it('returns correct breakpoint for different widths', () => {
    // Test different viewport widths
    const testCases = [
      { width: 320, expected: 'xs' },
      { width: 640, expected: 'sm' },
      { width: 768, expected: 'md' },
      { width: 1024, expected: 'lg' },
      { width: 1280, expected: 'xl' },
      { width: 1600, expected: '2xl' }
    ];

    testCases.forEach(({ width, expected }) => {
      mockUseViewport.mockReturnValue({
        deviceType: width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop',
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        width
      });

      const { result } = renderHook(() => useResponsiveImage());
      expect(result.current.getCurrentBreakpoint()).toBe(expected);
    });
  });
});

describe('useImageLoader', () => {
  beforeEach(() => {
    useViewport.mockReturnValue({
      isMobile: false
    });
  });

  it('initializes with loading state', () => {
    const { result } = renderHook(() => useImageLoader('/test-image.jpg'));
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.hasError).toBe(false);
    expect(result.current.src).toBe('/test-image.jpg');
  });

  it('handles successful image load', () => {
    const { result } = renderHook(() => useImageLoader('/test-image.jpg'));
    
    act(() => {
      result.current.handleLoad();
    });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasError).toBe(false);
  });

  it('handles image load error', () => {
    const { result } = renderHook(() => useImageLoader('/test-image.jpg'));
    
    act(() => {
      result.current.handleError();
    });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasError).toBe(true);
  });

  it('switches to fallback source on error', () => {
    const { result } = renderHook(() => 
      useImageLoader('/test-image.jpg', '/fallback-image.jpg')
    );
    
    act(() => {
      result.current.handleError();
    });
    
    expect(result.current.src).toBe('/fallback-image.jpg');
    expect(result.current.isLoading).toBe(true);
    expect(result.current.hasError).toBe(false);
  });

  it('provides retry functionality', () => {
    const { result } = renderHook(() => useImageLoader('/test-image.jpg'));
    
    // Simulate error
    act(() => {
      result.current.handleError();
    });
    
    expect(result.current.hasError).toBe(true);
    
    // Retry
    act(() => {
      result.current.retry();
    });
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.hasError).toBe(false);
  });

  it('updates src when prop changes', () => {
    const { result, rerender } = renderHook(
      ({ src }) => useImageLoader(src),
      { initialProps: { src: '/image1.jpg' } }
    );
    
    expect(result.current.src).toBe('/image1.jpg');
    
    rerender({ src: '/image2.jpg' });
    
    expect(result.current.src).toBe('/image2.jpg');
    expect(result.current.isLoading).toBe(true);
    expect(result.current.hasError).toBe(false);
  });
});

describe('useResponsiveAspectRatio', () => {
  beforeEach(() => {
    useViewport.mockReturnValue({
      isMobile: false,
      isTablet: false
    });
  });

  it('returns default aspect ratio for desktop', () => {
    const { result } = renderHook(() => useResponsiveAspectRatio('square'));
    
    expect(result.current.getAspectRatio()).toBe('square');
    expect(result.current.getAspectRatioClass()).toBe('aspect-square');
  });

  it('adjusts aspect ratios for mobile devices', () => {
    useViewport.mockReturnValue({
      isMobile: true,
      isTablet: false
    });

    const { result } = renderHook(() => useResponsiveAspectRatio());
    
    // Landscape becomes video on mobile
    expect(result.current.getAspectRatio('landscape')).toBe('video');
    expect(result.current.getAspectRatioClass('landscape')).toBe('aspect-video');
    
    // Portrait becomes square on mobile
    expect(result.current.getAspectRatio('portrait')).toBe('square');
    expect(result.current.getAspectRatioClass('portrait')).toBe('aspect-square');
  });

  it('returns correct CSS classes for different aspect ratios', () => {
    const { result } = renderHook(() => useResponsiveAspectRatio());
    
    expect(result.current.getAspectRatioClass('square')).toBe('aspect-square');
    expect(result.current.getAspectRatioClass('video')).toBe('aspect-video');
    expect(result.current.getAspectRatioClass('portrait')).toBe('aspect-[3/4]');
    expect(result.current.getAspectRatioClass('landscape')).toBe('aspect-[4/3]');
    expect(result.current.getAspectRatioClass('wide')).toBe('aspect-[21/9]');
    expect(result.current.getAspectRatioClass('auto')).toBe('');
  });
});