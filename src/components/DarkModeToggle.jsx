"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "../hooks/useTheme";

const DarkModeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="ml-4 p-2 rounded-md text-foreground hover:bg-accent hover:text-accent-foreground focus-ring theme-transition"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <FontAwesomeIcon 
        icon={isDark ? faSun : faMoon} 
        className="w-5 h-5"
      />
    </button>
  );
};

export default DarkModeToggle;