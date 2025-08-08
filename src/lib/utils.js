/**
 * Utility function for conditionally joining classNames
 * Simple implementation without external dependencies
 */
export function cn(...inputs) {
  return inputs
    .flat()
    .filter(Boolean)
    .join(' ')
    .trim();
}

/**
 * Utility function for theme-aware class selection
 */
export function themeClass(lightClass, darkClass, theme) {
  return theme === 'dark' ? darkClass : lightClass;
}

/**
 * Utility function for creating responsive classes
 */
export function responsive(base, sm, md, lg, xl) {
  const classes = [base];
  if (sm) classes.push(`sm:${sm}`);
  if (md) classes.push(`md:${md}`);
  if (lg) classes.push(`lg:${lg}`);
  if (xl) classes.push(`xl:${xl}`);
  return classes.join(' ');
}