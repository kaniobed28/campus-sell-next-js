"use client";

import { useContext } from 'react';
import { ThemeContext } from '../components/ThemeProvider';

/**
 * Custom hook for accessing theme context
 * Provides theme state and theme manipulation functions
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

/**
 * Hook for theme validation and error handling
 */
export const useThemeValidation = () => {
  const { theme, setTheme } = useTheme();
  
  const validateTheme = (themeValue) => {
    const validThemes = ['light', 'dark'];
    return validThemes.includes(themeValue);
  };
  
  const setValidatedTheme = (newTheme) => {
    if (validateTheme(newTheme)) {
      setTheme(newTheme);
      return true;
    } else {
      console.warn(`Invalid theme: ${newTheme}. Valid themes are: light, dark`);
      return false;
    }
  };
  
  return {
    theme,
    setTheme: setValidatedTheme,
    validateTheme,
    isValidTheme: validateTheme(theme),
  };
};

/**
 * Hook for system theme detection
 */
export const useSystemTheme = () => {
  const getSystemTheme = () => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  
  return {
    systemTheme: getSystemTheme(),
    isSystemDark: getSystemTheme() === 'dark',
  };
};