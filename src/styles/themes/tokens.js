// Design tokens for Campus Sell theme system
export const colorTokens = {
  // Brand Colors
  brand: {
    primary: '#0f172a',      // Campus Sell Navy
    secondary: '#1e40af',    // Deep Blue
    accent: '#38bdf8',       // Sky Blue
  },
  
  // Semantic Colors
  semantic: {
    success: '#10b981',      // Green
    warning: '#f59e0b',      // Amber
    error: '#ef4444',        // Red
    info: '#3b82f6',         // Blue
  },
  
  // Neutral Colors
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  }
};

export const typographyTokens = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'monospace'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
  },
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  }
};

export const spacingTokens = {
  0: '0px',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
  40: '10rem',
  48: '12rem',
  56: '14rem',
  64: '16rem',
};

export const borderRadiusTokens = {
  none: '0px',
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
};

export const shadowTokens = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: '0 0 #0000',
};

// Theme-specific color mappings with WCAG AA compliance
export const lightThemeColors = {
  background: colorTokens.neutral[50],
  foreground: colorTokens.neutral[900],
  card: '#ffffff',
  cardForeground: colorTokens.neutral[900],
  popover: '#ffffff',
  popoverForeground: colorTokens.neutral[900],
  primary: colorTokens.brand.primary,
  primaryForeground: '#ffffff',
  secondary: colorTokens.neutral[100],
  secondaryForeground: colorTokens.neutral[900],
  muted: colorTokens.neutral[100],
  mutedForeground: colorTokens.neutral[600], // Improved contrast from 500 to 600
  accent: colorTokens.brand.accent,
  accentForeground: colorTokens.brand.primary,
  destructive: colorTokens.semantic.error,
  destructiveForeground: '#ffffff',
  border: colorTokens.neutral[200],
  input: colorTokens.neutral[200],
  ring: colorTokens.brand.accent,
  // Additional semantic colors for better contrast
  success: colorTokens.semantic.success,
  warning: '#d97706', // Darker warning for better contrast
  info: colorTokens.semantic.info,
};

export const darkThemeColors = {
  background: colorTokens.neutral[900],
  foreground: colorTokens.neutral[50],
  card: colorTokens.neutral[800],
  cardForeground: colorTokens.neutral[50],
  popover: colorTokens.neutral[800],
  popoverForeground: colorTokens.neutral[50],
  primary: colorTokens.brand.accent,
  primaryForeground: colorTokens.brand.primary,
  secondary: colorTokens.neutral[800],
  secondaryForeground: colorTokens.neutral[50],
  muted: colorTokens.neutral[800],
  mutedForeground: colorTokens.neutral[300], // Improved contrast from 400 to 300
  accent: colorTokens.brand.accent,
  accentForeground: colorTokens.brand.primary,
  destructive: '#f87171', // Lighter red for dark mode
  destructiveForeground: colorTokens.neutral[900],
  border: colorTokens.neutral[700],
  input: colorTokens.neutral[700],
  ring: colorTokens.brand.accent,
  // Additional semantic colors for better contrast in dark mode
  success: '#4ade80', // Lighter green for dark mode
  warning: '#fbbf24', // Lighter warning for dark mode
  info: '#60a5fa', // Lighter blue for dark mode
};