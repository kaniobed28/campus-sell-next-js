/**
 * @jest-environment jsdom
 */
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider } from '../../components/ThemeProvider';
import { useTheme, useThemeValidation, useSystemTheme } from '../useTheme';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: query.includes('dark'),
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const wrapper = ({ children }) => (
  <ThemeProvider defaultTheme="light">
    {children}
  </ThemeProvider>
);

describe('useTheme', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    document.documentElement.className = '';
  });

  test('returns theme context values', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current).toHaveProperty('theme');
    expect(result.current).toHaveProperty('setTheme');
    expect(result.current).toHaveProperty('toggleTheme');
  });

  test('toggleTheme switches between light and dark', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('light');
  });
});

describe('useThemeValidation', () => {
  test('validates theme values correctly', () => {
    const { result } = renderHook(() => useThemeValidation(), { wrapper });

    expect(result.current.validateTheme('light')).toBe(true);
    expect(result.current.validateTheme('dark')).toBe(true);
    expect(result.current.validateTheme('invalid')).toBe(false);
  });

  test('setValidatedTheme only accepts valid themes', () => {
    const { result } = renderHook(() => useThemeValidation(), { wrapper });
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const success = result.current.setTheme('dark');
    expect(success).toBe(true);

    const failure = result.current.setTheme('invalid');
    expect(failure).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Invalid theme: invalid. Valid themes are: light, dark'
    );

    consoleSpy.mockRestore();
  });
});

describe('useSystemTheme', () => {
  test('detects system theme preference', () => {
    // Mock dark mode preference
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query.includes('dark'),
      media: query,
    }));

    const { result } = renderHook(() => useSystemTheme());

    expect(result.current.systemTheme).toBe('dark');
    expect(result.current.isSystemDark).toBe(true);
  });

  test('handles light mode preference', () => {
    // Mock light mode preference
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
    }));

    const { result } = renderHook(() => useSystemTheme());

    expect(result.current.systemTheme).toBe('light');
    expect(result.current.isSystemDark).toBe(false);
  });
});