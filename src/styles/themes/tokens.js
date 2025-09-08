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

// Responsive typography configuration
export const responsiveTypographyTokens = {
  // Responsive font sizes with mobile-first approach
  responsiveFontSizes: {
    // Display headings - large impact text
    'display-xl': {
      mobile: ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em' }],    // 36px
      tablet: ['3rem', { lineHeight: '3.5rem', letterSpacing: '-0.025em' }],       // 48px
      desktop: ['4.5rem', { lineHeight: '5rem', letterSpacing: '-0.025em' }],      // 72px
    },
    'display-lg': {
      mobile: ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em' }],  // 30px
      tablet: ['2.25rem', { lineHeight: '2.75rem', letterSpacing: '-0.025em' }],   // 36px
      desktop: ['3.75rem', { lineHeight: '4.25rem', letterSpacing: '-0.025em' }],  // 60px
    },
    'display-md': {
      mobile: ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.025em' }],       // 24px
      tablet: ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em' }],  // 30px
      desktop: ['3rem', { lineHeight: '3.5rem', letterSpacing: '-0.025em' }],      // 48px
    },
    
    // Heading hierarchy
    'heading-1': {
      mobile: ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.025em' }],       // 24px
      tablet: ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em' }],  // 30px
      desktop: ['2.25rem', { lineHeight: '2.75rem', letterSpacing: '-0.025em' }],  // 36px
    },
    'heading-2': {
      mobile: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }],   // 20px
      tablet: ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.025em' }],       // 24px
      desktop: ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em' }], // 30px
    },
    'heading-3': {
      mobile: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }],  // 18px
      tablet: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }],   // 20px
      desktop: ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.025em' }],      // 24px
    },
    'heading-4': {
      mobile: ['1rem', { lineHeight: '1.5rem', letterSpacing: '-0.025em' }],       // 16px
      tablet: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }],  // 18px
      desktop: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }],  // 20px
    },
    'heading-5': {
      mobile: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '-0.025em' }],  // 14px
      tablet: ['1rem', { lineHeight: '1.5rem', letterSpacing: '-0.025em' }],       // 16px
      desktop: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }], // 18px
    },
    'heading-6': {
      mobile: ['0.75rem', { lineHeight: '1rem', letterSpacing: '-0.025em' }],      // 12px
      tablet: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '-0.025em' }],  // 14px
      desktop: ['1rem', { lineHeight: '1.5rem', letterSpacing: '-0.025em' }],      // 16px
    },
    
    // Body text sizes
    'body-xl': {
      mobile: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '0' }],         // 18px
      tablet: ['1.25rem', { lineHeight: '1.875rem', letterSpacing: '0' }],         // 20px
      desktop: ['1.25rem', { lineHeight: '1.875rem', letterSpacing: '0' }],        // 20px
    },
    'body-lg': {
      mobile: ['1rem', { lineHeight: '1.625rem', letterSpacing: '0' }],            // 16px
      tablet: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '0' }],         // 18px
      desktop: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '0' }],        // 18px
    },
    'body-base': {
      mobile: ['0.875rem', { lineHeight: '1.375rem', letterSpacing: '0' }],        // 14px
      tablet: ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],              // 16px
      desktop: ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],             // 16px
    },
    'body-sm': {
      mobile: ['0.75rem', { lineHeight: '1.125rem', letterSpacing: '0' }],         // 12px
      tablet: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0' }],         // 14px
      desktop: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0' }],        // 14px
    },
    'body-xs': {
      mobile: ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0' }],           // 11px
      tablet: ['0.75rem', { lineHeight: '1.125rem', letterSpacing: '0' }],         // 12px
      desktop: ['0.75rem', { lineHeight: '1.125rem', letterSpacing: '0' }],        // 12px
    },
    
    // Caption and label text
    'caption': {
      mobile: ['0.625rem', { lineHeight: '0.875rem', letterSpacing: '0.025em' }],  // 10px
      tablet: ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],     // 11px
      desktop: ['0.75rem', { lineHeight: '1.125rem', letterSpacing: '0.025em' }],  // 12px
    },
    'label': {
      mobile: ['0.75rem', { lineHeight: '1.125rem', letterSpacing: '0.025em' }],   // 12px
      tablet: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em' }],   // 14px
      desktop: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em' }],  // 14px
    },
  },
  
  // Responsive line height multipliers for better readability
  responsiveLineHeights: {
    tight: {
      mobile: '1.25',
      tablet: '1.25',
      desktop: '1.25',
    },
    snug: {
      mobile: '1.375',
      tablet: '1.375',
      desktop: '1.375',
    },
    normal: {
      mobile: '1.5',
      tablet: '1.5',
      desktop: '1.5',
    },
    relaxed: {
      mobile: '1.625',
      tablet: '1.625',
      desktop: '1.625',
    },
    loose: {
      mobile: '1.75',
      tablet: '1.75',
      desktop: '1.75',
    },
  },
  
  // Responsive letter spacing for optimal readability
  responsiveLetterSpacing: {
    tighter: {
      mobile: '-0.05em',
      tablet: '-0.05em',
      desktop: '-0.05em',
    },
    tight: {
      mobile: '-0.025em',
      tablet: '-0.025em',
      desktop: '-0.025em',
    },
    normal: {
      mobile: '0em',
      tablet: '0em',
      desktop: '0em',
    },
    wide: {
      mobile: '0.025em',
      tablet: '0.025em',
      desktop: '0.025em',
    },
    wider: {
      mobile: '0.05em',
      tablet: '0.05em',
      desktop: '0.05em',
    },
    widest: {
      mobile: '0.1em',
      tablet: '0.1em',
      desktop: '0.1em',
    },
  },
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