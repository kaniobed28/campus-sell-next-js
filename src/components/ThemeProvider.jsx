"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

export const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => null,
  toggleTheme: () => null,
});

export function ThemeProvider({ children, defaultTheme = 'light', storageKey = 'campus-sell-theme' }) {
  const [theme, setTheme] = useState(defaultTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Get theme from localStorage or system preference
    const storedTheme = localStorage.getItem(storageKey);
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = storedTheme || systemTheme;
    
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, [storageKey]);

  const applyTheme = (newTheme) => {
    const root = window.document.documentElement;
    
    // Add theme-switching class to disable transitions temporarily
    root.classList.add('theme-switching');
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add new theme class
    root.classList.add(newTheme);
    
    // Store theme preference
    localStorage.setItem(storageKey, newTheme);
    
    // Remove theme-switching class after a brief delay to re-enable transitions
    requestAnimationFrame(() => {
      setTimeout(() => {
        root.classList.remove('theme-switching');
      }, 50);
    });
  };

  const setThemeWithPersistence = (newTheme) => {
    if (!mounted) return;
    
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeWithPersistence(newTheme);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  const value = {
    theme,
    setTheme: setThemeWithPersistence,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}