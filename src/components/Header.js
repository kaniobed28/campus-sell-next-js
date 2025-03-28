"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import SearchBar from "./SearchBar";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";
import DarkModeToggle from "./DarkModeToggle";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [products, setProducts] = useState([]);

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
    return () => unsubscribe();
  }, []);

  // Mock product data (replace with Firebase fetch later)
  useEffect(() => {
    const mockProducts = [
      { id: "5kztIYBg2MLeVlwIXine", title: "54y4t", price: 45, category: "Home" },
      { id: "CLvDfuyypdTaIbHU3SZA", title: "Laptop", price: 800, category: "Electronics" },
    ];
    setProducts(mockProducts);
  }, []);

  // Toggle dark mode and persist preference
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("darkMode", newMode);
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
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isSearching={isSearching}
          setIsSearching={setIsSearching}
          products={products}
        />

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLinks user={user} handleSignOut={handleSignOut} onLinkClick={() => {}} />
        </nav>

        {/* Dark Mode Toggle */}
        <DarkModeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

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
      <MobileMenu
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        user={user}
        handleSignOut={handleSignOut}
      />
    </header>
  );
};

export default Header;