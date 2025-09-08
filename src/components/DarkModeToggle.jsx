"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "../hooks/useTheme";
import { useViewport } from "../hooks/useViewport";

const DarkModeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const { isMobile, isTouchDevice } = useViewport();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2 sm:p-3 rounded-md text-foreground hover:bg-accent hover:text-accent-foreground 
        focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background 
        theme-transition transition-all duration-200 
        min-w-[44px] min-h-[44px] flex items-center justify-center
        ${isTouchDevice ? 'hover:scale-105 active:scale-95' : ''}
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <FontAwesomeIcon 
        icon={isDark ? faSun : faMoon} 
        className={`${isMobile ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-5 h-5'} transition-transform duration-200`}
      />
    </button>
  );
};

export default DarkModeToggle;