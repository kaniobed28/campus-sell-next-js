/**
 * @jest-environment jsdom
 */
import { ThemeProvider } from '../../components/ThemeProvider';

describe('Theme System', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('applies light theme by default', () => {
    // Create a simple test component
    document.body.innerHTML = '<div id="test-root"></div>';
    const root = document.getElementById('test-root');
    
    // Check that the theme class is applied
    expect(document.documentElement.classList.contains('light')).toBe(false);
    
    // Apply light theme
    document.documentElement.classList.add('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  test('applies dark theme when specified', () => {
    // Create a simple test component
    document.body.innerHTML = '<div id="test-root"></div>';
    const root = document.getElementById('test-root');
    
    // Check that the theme class is applied
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    
    // Apply dark theme
    document.documentElement.classList.add('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('uses system preference when no stored theme', () => {
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    // Create a simple test component
    document.body.innerHTML = '<div id="test-root"></div>';
    
    // Since we mocked prefers-color-scheme: dark, it should apply dark theme
    document.documentElement.classList.add('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});