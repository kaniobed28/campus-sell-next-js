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
import { useViewport } from "@/hooks/useViewport";
import { adminAuthService } from "@/services/adminAuthService";
import BasketCounter from "./BasketCounter";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [products, setProducts] = useState([]);
  const { isMobile, isTablet, isDesktop } = useViewport();
  
  // Basket functionality has been removed

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Check admin status when user changes
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user && user.email) {
        setAdminLoading(true);
        try {
          const admin = await adminAuthService.checkAdminStatus(user.email);
          setIsAdmin(!!admin);
        } catch (error) {
          console.error("Error checking admin status:", error.message);
          setIsAdmin(false);
        } finally {
          setAdminLoading(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

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
        <div className="w-full max-w-none px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4 min-h-[56px] sm:min-h-[60px]">
          {/* Logo - Enhanced responsive sizing with overflow protection */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className={`font-bold tracking-wide text-primary hover:text-accent theme-transition focus-ring rounded-md px-2 py-1 transition-all duration-200 ${
                isMobile ? 'text-base sm:text-lg' : isTablet ? 'text-lg md:text-xl' : 'text-xl lg:text-2xl'
              }`}
            >
              <span className="whitespace-nowrap">
                {isMobile ? 'CS' : isTablet ? 'Campus' : 'Campus Sell'}
              </span>
            </Link>
          </div>

          {/* Search Bar - Enhanced responsive display with better max-width handling */}
          {!isMobile && (
            <div className="flex-1 max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-2 sm:mx-3 md:mx-4 lg:mx-6 xl:mx-8 overflow-hidden">
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

          {/* Right side controls - Enhanced spacing and overflow handling */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 flex-shrink-0">
            {/* Search Icon - Mobile only with enhanced touch target */}
            {isMobile && (
              <button
                className="p-2 sm:p-3 rounded-md text-foreground hover:bg-accent hover:text-accent-foreground focus-ring theme-transition min-w-[44px] min-h-[44px] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                onClick={() => setIsSearchModalOpen(true)}
                aria-label="Open Search"
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}

            <BasketCounter />

            {/* Desktop Navigation - Hidden on smaller screens */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2" role="navigation" aria-label="Main navigation">
              <NavLinks user={user} handleSignOut={handleSignOut} onLinkClick={() => {}} />
            </nav>

            {/* Dark Mode Toggle - Responsive sizing */}
            <div className="flex-shrink-0">
              <DarkModeToggle />
            </div>

            {/* Enhanced Hamburger Menu - Better responsive behavior */}
            <button
              className="lg:hidden p-2 sm:p-3 rounded-lg text-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center hover:scale-105 active:scale-95 flex-shrink-0"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
            >
              <FontAwesomeIcon 
                icon={isMenuOpen ? faTimes : faBars} 
                className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 transition-transform duration-200 ${
                  isMenuOpen ? 'rotate-90' : 'rotate-0'
                }`} 
              />
            </button>
          </div>
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
        isAdmin={isAdmin}
        handleSignOut={handleSignOut}
      />
    </>
  );
};

export default Header;