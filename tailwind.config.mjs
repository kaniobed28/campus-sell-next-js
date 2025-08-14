import { colorTokens, typographyTokens, spacingTokens, borderRadiusTokens, shadowTokens } from './src/styles/themes/tokens.js';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable dark mode using the 'class' strategy
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Theme-aware colors using CSS custom properties
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        'card-foreground': "var(--card-foreground)",
        popover: "var(--popover)",
        'popover-foreground': "var(--popover-foreground)",
        primary: "var(--primary)",
        'primary-foreground': "var(--primary-foreground)",
        secondary: "var(--secondary)",
        'secondary-foreground': "var(--secondary-foreground)",
        muted: "var(--muted)",
        'muted-foreground': "var(--muted-foreground)",
        accent: "var(--accent)",
        'accent-foreground': "var(--accent-foreground)",
        destructive: "var(--destructive)",
        'destructive-foreground': "var(--destructive-foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        
        // Brand colors (static)
        'brand-primary': colorTokens.brand.primary,
        'brand-secondary': colorTokens.brand.secondary,
        'brand-accent': colorTokens.brand.accent,
        
        // Semantic colors (theme-aware)
        success: "var(--success)",
        warning: "var(--warning)",
        error: colorTokens.semantic.error,
        info: "var(--info)",
        
        // Neutral palette (static)
        neutral: colorTokens.neutral,
      },
      fontFamily: typographyTokens.fontFamily,
      fontSize: typographyTokens.fontSize,
      fontWeight: typographyTokens.fontWeight,
      spacing: spacingTokens,
      borderRadius: borderRadiusTokens,
      boxShadow: shadowTokens,
    },
  },
  plugins: [],
};
