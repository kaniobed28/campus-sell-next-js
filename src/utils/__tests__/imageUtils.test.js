import {
  generateSrcSet,
  getOptimalDimensions,
  isFormatSupported,
  getPreferredFormat,
  generateBlurDataURL,
  calculateAspectRatio,
  getResponsiveSizes,
  getLoadingStrategy
} from '../imageUtils';

// Mock window and document for browser APIs
const mockWindow = {
  location: { origin: 'https://example.com' },
  devicePixelRatio: 2
};

const mockCanvas = {
  width: 0,
  height: 0,
  getContext: jest.fn(() => ({
    fillStyle: '',
    fillRect: jest.fn()
  })),
  toDataURL: jest.fn(() => 'data:image/png;base64,mock')
};

const mockDocument = {
  createElement: jest.fn((tag) => {
    if (tag === 'canvas') return mockCanvas;
    return { appendChild: jest.fn() };
  }),
  head: { appendChild: jest.fn() }
};

// Setup global mocks
Object.defineProperty(global, 'window', { value: mockWindow, writable: true });
Object.defineProperty(global, 'document', { value: mockDocument, writable: true });

describe('imageUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSrcSet', () => {
    it('returns empty string for no src', () => {
      expect(generateSrcSet('')).toBe('');
      expect(generateSrcSet(null)).toBe('');
      expect(generateSrcSet(undefined)).toBe('');
    });

    it('returns empty string for Next.js optimized images', () => {
      expect(generateSrcSet('/_next/image?url=test.jpg')).toBe('');
    });

    it('returns empty string for static imports', () => {
      expect(generateSrcSet({ src: 'test.jpg', width: 100, height: 100 })).toBe('');
    });

    it('generates srcSet for external URLs', () => {
      const result = generateSrcSet('https://example.com/image.jpg');
      expect(result).toContain('320w');
      expect(result).toContain('640w');
      expect(result).toContain('768w');
      expect(result).toContain('1024w');
    });

    it('uses custom widths when provided', () => {
      const result = generateSrcSet('https://example.com/image.jpg', [400, 800]);
      expect(result).toContain('400w');
      expect(result).toContain('800w');
      expect(result).not.toContain('320w');
    });

    it('uses custom format when provided', () => {
      const result = generateSrcSet('https://example.com/image.jpg', [400], 'avif');
      expect(result).toContain('f=avif');
    });
  });

  describe('getOptimalDimensions', () => {
    it('calculates dimensions with device pixel ratio', () => {
      const result = getOptimalDimensions(300, 200, 'desktop');
      expect(result.width).toBe(600); // 300 * 2
      expect(result.height).toBe(400); // 200 * 2
      expect(result.pixelRatio).toBe(2);
    });

    it('caps pixel ratio at 2x for mobile', () => {
      // Mock higher pixel ratio
      Object.defineProperty(global.window, 'devicePixelRatio', { value: 3 });
      
      const result = getOptimalDimensions(300, 200, 'mobile');
      expect(result.pixelRatio).toBe(2); // Capped at 2
    });

    it('handles missing window object', () => {
      const originalWindow = global.window;
      delete global.window;
      
      const result = getOptimalDimensions(300, 200, 'desktop');
      expect(result.width).toBe(300); // No pixel ratio applied
      expect(result.height).toBe(200);
      expect(result.pixelRatio).toBe(1);
      
      global.window = originalWindow;
    });
  });

  describe('isFormatSupported', () => {
    it('returns false when window is not available', () => {
      const originalWindow = global.window;
      delete global.window;
      
      expect(isFormatSupported('webp')).toBe(false);
      
      global.window = originalWindow;
    });

    it('checks format support using canvas', () => {
      mockCanvas.toDataURL.mockReturnValue('data:image/webp;base64,mock');
      
      expect(isFormatSupported('webp')).toBe(true);
      expect(mockDocument.createElement).toHaveBeenCalledWith('canvas');
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/webp');
    });

    it('returns false for unsupported formats', () => {
      mockCanvas.toDataURL.mockReturnValue('data:image/png;base64,mock');
      
      expect(isFormatSupported('webp')).toBe(false);
    });

    it('handles canvas errors gracefully', () => {
      mockCanvas.toDataURL.mockImplementation(() => {
        throw new Error('Canvas error');
      });
      
      expect(isFormatSupported('webp')).toBe(false);
    });
  });

  describe('getPreferredFormat', () => {
    it('returns jpg when window is not available', () => {
      const originalWindow = global.window;
      delete global.window;
      
      expect(getPreferredFormat()).toBe('jpg');
      
      global.window = originalWindow;
    });

    it('prefers AVIF when supported', () => {
      mockCanvas.toDataURL.mockImplementation((format) => {
        if (format === 'image/avif') return 'data:image/avif;base64,mock';
        return 'data:image/png;base64,mock';
      });
      
      expect(getPreferredFormat()).toBe('avif');
    });

    it('falls back to WebP when AVIF not supported', () => {
      mockCanvas.toDataURL.mockImplementation((format) => {
        if (format === 'image/webp') return 'data:image/webp;base64,mock';
        return 'data:image/png;base64,mock';
      });
      
      expect(getPreferredFormat()).toBe('webp');
    });

    it('falls back to JPEG when neither AVIF nor WebP supported', () => {
      mockCanvas.toDataURL.mockReturnValue('data:image/png;base64,mock');
      
      expect(getPreferredFormat()).toBe('jpg');
    });
  });

  describe('generateBlurDataURL', () => {
    it('generates blur data URL with default parameters', () => {
      const result = generateBlurDataURL();
      expect(mockDocument.createElement).toHaveBeenCalledWith('canvas');
      expect(mockCanvas.toDataURL).toHaveBeenCalled();
      expect(result).toBe('data:image/png;base64,mock');
    });

    it('uses custom dimensions and color', () => {
      const mockContext = {
        fillStyle: '',
        fillRect: jest.fn()
      };
      mockCanvas.getContext.mockReturnValue(mockContext);
      
      generateBlurDataURL(20, 15, '#ff0000');
      
      expect(mockCanvas.width).toBe(20);
      expect(mockCanvas.height).toBe(15);
      expect(mockContext.fillStyle).toBe('#ff0000');
      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 20, 15);
    });
  });

  describe('calculateAspectRatio', () => {
    it('calculates correct aspect ratio', () => {
      expect(calculateAspectRatio(1920, 1080)).toBeCloseTo(1.778, 3);
      expect(calculateAspectRatio(1080, 1920)).toBeCloseTo(0.5625, 4);
      expect(calculateAspectRatio(100, 100)).toBe(1);
    });

    it('returns 1 for invalid dimensions', () => {
      expect(calculateAspectRatio(0, 100)).toBe(1);
      expect(calculateAspectRatio(100, 0)).toBe(1);
      expect(calculateAspectRatio(null, 100)).toBe(1);
      expect(calculateAspectRatio(100, undefined)).toBe(1);
    });
  });

  describe('getResponsiveSizes', () => {
    it('returns correct sizes for hero layout', () => {
      expect(getResponsiveSizes('hero')).toBe('100vw');
    });

    it('returns correct sizes for full-width layout', () => {
      expect(getResponsiveSizes('full-width')).toBe('(max-width: 1200px) 100vw, 1200px');
    });

    it('returns correct sizes for grid layouts', () => {
      expect(getResponsiveSizes('grid-1')).toBe('100vw');
      expect(getResponsiveSizes('grid-2')).toBe('(max-width: 640px) 100vw, 50vw');
      expect(getResponsiveSizes('grid-3')).toBe('(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw');
      expect(getResponsiveSizes('grid-4')).toBe('(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw');
    });

    it('returns correct sizes for sidebar layout', () => {
      expect(getResponsiveSizes('sidebar')).toBe('(max-width: 768px) 100vw, 25vw');
    });

    it('returns correct sizes for thumbnail layout', () => {
      expect(getResponsiveSizes('thumbnail')).toBe('(max-width: 640px) 25vw, (max-width: 768px) 20vw, 15vw');
    });

    it('handles custom grid with columns', () => {
      expect(getResponsiveSizes('custom-grid', { columns: 3 })).toBe('(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw');
    });

    it('uses custom maxWidth when provided', () => {
      expect(getResponsiveSizes('full-width', { maxWidth: '800px' })).toBe('(max-width: 800px) 100vw, 800px');
    });

    it('returns default sizes for unknown layout', () => {
      expect(getResponsiveSizes('unknown')).toBe('(max-width: 640px) 100vw, 50vw');
    });
  });

  describe('getLoadingStrategy', () => {
    it('returns correct strategy for hero images', () => {
      const strategy = getLoadingStrategy(true, 'desktop', true);
      expect(strategy.priority).toBe(true);
      expect(strategy.loading).toBe('eager');
      expect(strategy.placeholder).toBe('blur');
      expect(strategy.quality).toBe(75);
    });

    it('returns correct strategy for above-fold desktop images', () => {
      const strategy = getLoadingStrategy(true, 'desktop', false);
      expect(strategy.priority).toBe(true);
      expect(strategy.loading).toBe('eager');
      expect(strategy.placeholder).toBe('blur');
      expect(strategy.quality).toBe(75);
    });

    it('returns correct strategy for above-fold mobile images', () => {
      const strategy = getLoadingStrategy(true, 'mobile', false);
      expect(strategy.priority).toBe(false); // No priority for mobile non-hero
      expect(strategy.loading).toBe('eager');
      expect(strategy.placeholder).toBe('blur');
      expect(strategy.quality).toBe(60); // Reduced quality for mobile
    });

    it('returns correct strategy for below-fold images', () => {
      const strategy = getLoadingStrategy(false, 'desktop', false);
      expect(strategy.priority).toBe(false);
      expect(strategy.loading).toBe('lazy');
      expect(strategy.placeholder).toBe('empty');
      expect(strategy.quality).toBe(75);
    });

    it('returns correct strategy for tablet images', () => {
      const strategy = getLoadingStrategy(true, 'tablet', false);
      expect(strategy.priority).toBe(false);
      expect(strategy.loading).toBe('eager');
      expect(strategy.placeholder).toBe('blur');
      expect(strategy.quality).toBe(70); // Medium quality for tablet
    });
  });
});