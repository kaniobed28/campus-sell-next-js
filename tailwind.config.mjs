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
        // Professional Light Mode Colors
        background: "var(--background, #f9f9f9)", // Light background (light gray)
        foreground: "var(--foreground, #1e293b)", // Darker text for readability
        primary: "#0f172a", // Professional dark navy blue
        secondary: "#1e40af", // Deep blue for accents
        accent: "#38bdf8", // Sky blue for highlights
        danger: "#ef4444", // Alert red

        // Professional Dark Mode Colors
        "background-dark": "#0f172a", // Dark navy background
        "foreground-dark": "#e2e8f0", // Light gray for text
        "primary-dark": "#1e293b", // Dark grayish blue
        "secondary-dark": "#3b82f6", // Bright blue for contrast
        "accent-dark": "#67e8f9", // Lighter sky blue
        "danger-dark": "#f87171", // Softer red for dark mode
      },
    },
  },
  plugins: [],
};
