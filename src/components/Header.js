"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Check the stored theme preference on load
  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedTheme);
    if (savedTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); // Cleanup listener
  }, []);

  // Toggle dark mode and persist preference
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("darkMode", newMode); // Save preference
      if (newMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return newMode;
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      alert("Signed out successfully!");
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  return (
    <header className="bg-background text-foreground sticky top-0 z-50 shadow-md dark:bg-background-dark dark:text-foreground-dark">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-3xl font-bold tracking-wide hover:text-secondary transition dark:hover:text-secondary-dark"
        >
          Campus Sell
        </Link>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 mx-6">
          <input
            type="text"
            placeholder="Search for products, categories..."
            className="w-full px-4 py-2 rounded-l-lg border border-primary focus:outline-none focus:ring-2 focus:ring-secondary shadow-sm dark:border-primary-dark dark:bg-background-dark dark:text-foreground-dark"
          />
          <button className="px-6 bg-accent text-foreground rounded-r-lg hover:bg-accent-dark transition-all shadow-md">
            Search
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="/categories"
            className="hover:text-secondary transition dark:hover:text-secondary-dark"
          >
            Categories
          </Link>
          <Link
            href="/listings"
            className="hover:text-secondary transition dark:hover:text-secondary-dark"
          >
            Listings
          </Link>
          <Link
            href="/contact"
            className="hover:text-secondary transition dark:hover:text-secondary-dark"
          >
            Contact Us
          </Link>
          {user ? (
            <>
              <Link
                href="/sell"
                className="px-4 py-2 bg-accent text-background rounded-lg hover:bg-accent-dark transition shadow-md dark:bg-accent-dark dark:text-background-dark"
              >
                Sell
              </Link>
              <Link
                href="/profile"
                className="hover:underline hover:text-secondary transition dark:hover:text-secondary-dark"
              >
                <span>Welcome, {user.email.split("@")[0]}!</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="text-danger hover:text-danger-dark transition"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className="hover:underline hover:text-secondary transition dark:hover:text-secondary-dark"
            >
              Sign In
            </Link>
          )}
        </nav>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="ml-4 text-3xl focus:outline-none"
          aria-label="Toggle Dark Mode"
        >
          <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
        </button>

        {/* Hamburger Menu */}
        <button
          className="md:hidden text-3xl focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <div
        className={`md:hidden fixed top-0 left-0 w-full h-full bg-background text-foreground transform dark:bg-background-dark dark:text-foreground-dark ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-50`}
      >
        <div className="flex flex-col items-center space-y-6 py-8">
          <button
            className="absolute top-4 right-4 text-foreground text-2xl dark:text-foreground-dark"
            onClick={() => setIsMenuOpen(false)}
          >
            ✕
          </button>
          <Link
            href="/categories"
            className="text-lg hover:text-secondary transition dark:hover:text-secondary-dark"
            onClick={() => setIsMenuOpen(false)}
          >
            Categories
          </Link>
          <Link
            href="/listings"
            className="text-lg hover:text-secondary transition dark:hover:text-secondary-dark"
            onClick={() => setIsMenuOpen(false)}
          >
            Listings
          </Link>
          <Link
            href="/contact"
            className="text-lg hover:text-secondary transition dark:hover:text-secondary-dark"
            onClick={() => setIsMenuOpen(false)}
          >
            Contact Us
          </Link>
          {user ? (
            <>
              <Link
                href="/sell"
                className="px-6 py-2 bg-accent text-background rounded-lg hover:bg-accent-dark transition dark:bg-accent-dark dark:text-background-dark"
                onClick={() => setIsMenuOpen(false)}
              >
                Sell
              </Link>
              <Link
                href="/profile"
                className="text-lg hover:text-secondary transition dark:hover:text-secondary-dark"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>Welcome, {user.email.split("@")[0]}!</span>
              </Link>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleSignOut();
                }}
                className="text-danger hover:text-danger-dark transition"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className="text-lg hover:underline hover:text-secondary transition dark:hover:text-secondary-dark"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
