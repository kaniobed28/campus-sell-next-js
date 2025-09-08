"use client";

import React, { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import NavLinks from "./NavLinks";

const MobileMenu = ({ isMenuOpen, setIsMenuOpen, user, isAdmin, handleSignOut }) => {
  const menuRef = useRef(null);
  const closeButtonRef = useRef(null);
  const firstFocusableRef = useRef(null);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Enhanced keyboard navigation and focus management
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isMenuOpen) return;

      switch (e.key) {
        case 'Escape':
          setIsMenuOpen(false);
          break;
        case 'Tab':
          handleTabNavigation(e);
          break;
        default:
          break;
      }
    };

    const handleTabNavigation = (e) => {
      if (!menuRef.current) return;

      const focusableElements = menuRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab (backward)
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab (forward)
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus the close button when menu opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen, setIsMenuOpen]);

  // Focus management when menu closes
  useEffect(() => {
    if (!isMenuOpen) {
      // Return focus to the hamburger button when menu closes
      const hamburgerButton = document.querySelector('[aria-label="Toggle Menu"]');
      hamburgerButton?.focus();
    }
  }, [isMenuOpen]);

  return (
    <>
      {/* Enhanced Backdrop with improved animations */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 ease-out z-[55] ${
          isMenuOpen 
            ? "opacity-100 visible" 
            : "opacity-0 invisible"
        }`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Enhanced Menu Panel with improved animations and touch targets */}
      <div
        ref={menuRef}
        className={`lg:hidden fixed top-0 right-0 w-full max-w-sm h-full bg-background border-l border-border shadow-2xl transform transition-all duration-300 ease-out z-[60] ${
          isMenuOpen 
            ? "translate-x-0 opacity-100" 
            : "translate-x-full opacity-0"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-menu-title"
        aria-describedby="mobile-menu-description"
      >
        {/* Enhanced Menu Header with better spacing */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-card/50">
          <div>
            <h2 id="mobile-menu-title" className="text-xl font-semibold text-foreground">
              Navigation Menu
            </h2>
            <p id="mobile-menu-description" className="text-sm text-muted-foreground mt-1">
              Browse categories and access your account
            </p>
          </div>
          <button
            ref={closeButtonRef}
            className="p-3 rounded-lg text-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background transition-all duration-200 min-w-[48px] min-h-[48px] flex items-center justify-center hover:scale-105 active:scale-95"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
          </button>
        </div>

        {/* Enhanced Menu Content with improved spacing and animations */}
        <div className="flex flex-col p-6 space-y-2 overflow-y-auto flex-1">
          <NavLinks
            user={user}
            isAdmin={isAdmin}
            handleSignOut={handleSignOut}
            onLinkClick={() => setIsMenuOpen(false)}
            isMobile={true}
            ref={firstFocusableRef}
          />
        </div>

        {/* Menu Footer with additional info */}
        <div className="p-6 border-t border-border bg-card/30">
          <p className="text-xs text-muted-foreground text-center">
            Campus Sell - Your marketplace for student needs
          </p>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;