"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faMagnifyingGlass, faTimes } from "@fortawesome/free-solid-svg-icons";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import SearchBar from "./SearchBar";
import SearchModal from "./SearchModal";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";
import DarkModeToggle from "./DarkModeToggle";
import BasketCounter from "./BasketCounter";
import { useViewport } from "@/hooks/useViewport";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [products, setProducts] = useState([]);
  const { isMobile, isTablet, isDesktop } = useViewport();

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

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      alert("Signed out successfully!");
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  return (
    <>
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm theme-transition">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          {/* Logo - Responsive sizing */}
          <Link
            href="/"
            className={`font-bold tracking-wide text-primary hover:text-accent theme-transition focus-ring rounded-md px-2 py-1 ${
              isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl'
            }`}
          >
            {isMobile ? 'CS' : 'Campus Sell'}
          </Link>

          {/* Search Bar - Responsive display */}
          {!isMobile && (
            <div className="flex-1 max-w-md mx-4 lg:mx-8">
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isSearching={isSearching}
                setIsSearching={setIsSearching}
                products={products}
                variant={isTablet ? "compact" : "default"}
              />
            </div>
          )}

          {/* Right side controls */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Search Icon - Mobile only */}
            {isMobile && (
              <button
                className="p-3 rounded-md text-foreground hover:bg-accent hover:text-accent-foreground focus-ring theme-transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                onClick={() => setIsSearchModalOpen(true)}
                aria-label="Open Search"
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} className="w-5 h-5" />
              </button>
            )}

            {/* Basket Counter */}
            <BasketCounter className="theme-transition" />

            {/* Enhanced Navigation Links (Desktop) with better spacing and hover effects */}
            <nav className="hidden lg:flex items-center space-x-2" role="navigation" aria-label="Main navigation">
              <NavLinks user={user} handleSignOut={handleSignOut} onLinkClick={() => {}} />
            </nav>

            {/* Dark Mode Toggle */}
            <DarkModeToggle />

            {/* Enhanced Hamburger Menu - Touch-friendly with animations */}
            <button
              className="lg:hidden p-3 rounded-lg text-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background transition-all duration-200 min-w-[48px] min-h-[48px] flex items-center justify-center hover:scale-105 active:scale-95"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
            >
              <FontAwesomeIcon 
                icon={isMenuOpen ? faTimes : faBars} 
                className={`w-6 h-6 transition-transform duration-200 ${isMenuOpen ? 'rotate-90' : 'rotate-0'}`} 
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Search Modal */}
      <SearchModal
        isOpen={isMobile && isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearching={isSearching}
        setIsSearching={setIsSearching}
        products={products}
      />

      {/* Enhanced Mobile Menu with improved accessibility */}
      <MobileMenu
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        user={user}
        handleSignOut={handleSignOut}
      />
    </>
  );
};

export default Header;