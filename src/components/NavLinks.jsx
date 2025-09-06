"use client";

import React, { useState, forwardRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import SellerPromptModal from "./SellerPromptModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faList,
  faStore,
  faCog,
  faEnvelope,
  faUser,
  faSignOutAlt,
  faSignInAlt,
  faShoppingCart,
  faClipboardList,
  faUserShield
} from "@fortawesome/free-solid-svg-icons";
import { useViewport } from "@/hooks/useViewport";

const NavLinks = forwardRef(({ user, isAdmin, handleSignOut, onLinkClick, isMobile = false }, ref) => {
  const router = useRouter();
  const { isTouchDevice } = useViewport();
  const [modalState, setModalState] = useState({
    isOpen: false,
    message: "",
    primaryAction: null,
    secondaryAction: null,
  });
  const [hoveredLink, setHoveredLink] = useState(null);

  const openModal = (message, primaryAction, secondaryAction = { label: "Cancel" }) => {
    setModalState({
      isOpen: true,
      message,
      primaryAction,
      secondaryAction,
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      message: "",
      primaryAction: null,
      secondaryAction: null,
    });
  };

  const checkIfSeller = async () => {
    if (!user) {
      openModal("Please sign in to sell items.", {
        label: "Sign In",
        href: "/auth",
      });
      return false;
    }

    try {
      const sellerDocRef = doc(db, "sellers", user.uid);
      const sellerDoc = await getDoc(sellerDocRef);

      if (sellerDoc.exists()) {
        return true; // User is a seller
      } else {
        return new Promise((resolve) => {
          openModal("Do you want to be a seller?", {
            label: "Become a Seller",
            href: "/be-a-seller",
          }, {
            label: "No, thanks",
            onClick: () => resolve(false),
          });
          // The modal will handle navigation; we just need to resolve false if the user cancels
        });
      }
    } catch (error) {
      console.error("Error checking seller status:", error.message);
      openModal("An error occurred while checking your seller status.", {
        label: "OK",
        onClick: () => { },
      });
      return false;
    }
  };

  const handleSellClick = async (e) => {
    e.preventDefault();
    const isSeller = await checkIfSeller();
    if (isSeller) {
      router.push("/sell");
    }
  };

  // Enhanced responsive link classes with better touch targets and hover states
  const linkClass = isMobile
    ? "group block w-full text-left px-6 py-4 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-all duration-200 min-h-[48px] flex items-center space-x-3 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
    : "relative px-4 py-2 text-foreground hover:text-accent transition-all duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background hover:bg-accent/10 font-medium";

  const sellButtonClass = isMobile
    ? "group block w-full text-center px-6 py-4 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-all duration-200 font-semibold min-h-[48px] flex items-center justify-center space-x-3 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
    : "px-6 py-2.5 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-all duration-200 shadow-md hover:shadow-lg font-semibold focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background hover:scale-105 active:scale-95";

  const signOutButtonClass = isMobile
    ? "group block w-full text-left px-6 py-4 text-base font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200 min-h-[48px] flex items-center space-x-3 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 focus:ring-offset-background"
    : "px-4 py-2 text-destructive hover:text-destructive/80 hover:bg-destructive/10 transition-all duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 focus:ring-offset-background font-medium";

  // Navigation items configuration with icons
  const baseNavigationItems = [
    { href: "/categories", label: "Categories", icon: faList },
    { href: "/listings", label: "Listings", icon: faStore },
    { href: "/contact", label: "Contact Us", icon: faEnvelope }
  ];

  // Additional items for authenticated users
  const authenticatedUserItems = [
    { href: "/orders", label: "My Orders", icon: faClipboardList },
    { href: "/store", label: "My Store", icon: faStore }
  ];

  // Admin-specific items
  const adminItems = [
    { href: "/admin", label: "Admin Dashboard", icon: faUserShield }
  ];

  // Construct navigation items based on user role
  const navigationItems = [
    ...baseNavigationItems,
    ...(user ? authenticatedUserItems : []),
    ...(isAdmin ? adminItems : [])
  ];

  // Enhanced link component with hover effects
  const NavLink = ({ href, children, className, icon, isSpecial = false, ...props }) => (
    <Link
      href={href}
      className={className}
      onClick={onLinkClick}
      onMouseEnter={() => !isTouchDevice && setHoveredLink(href)}
      onMouseLeave={() => !isTouchDevice && setHoveredLink(null)}
      {...props}
    >
      {isMobile && icon && (
        <FontAwesomeIcon
          icon={icon}
          className={`w-5 h-5 ${isSpecial ? 'text-accent-foreground' : 'text-muted-foreground group-hover:text-accent-foreground'} transition-colors duration-200`}
        />
      )}
      <span className={isMobile ? 'flex-1' : ''}>{children}</span>
      {!isMobile && hoveredLink === href && (
        <div className="absolute inset-0 bg-accent/5 rounded-md -z-10 animate-pulse" />
      )}
    </Link>
  );

  return (
    <>
      {/* Main Navigation Links */}
      {navigationItems.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          className={linkClass}
          icon={item.icon}
          ref={item.href === "/categories" ? ref : null}
        >
          {item.label}
        </NavLink>
      ))}

      {/* Conditional User/Auth Section */}
      {user ? (
        <>
          {/* Sell Button - Special styling */}
          <Link
            href="/sell"
            onClick={handleSellClick}
            className={sellButtonClass}
            onMouseEnter={() => !isTouchDevice && setHoveredLink("/sell")}
            onMouseLeave={() => !isTouchDevice && setHoveredLink(null)}
          >
            {isMobile && (
              <FontAwesomeIcon
                icon={faShoppingCart}
                className="w-5 h-5 text-accent-foreground transition-colors duration-200"
              />
            )}
            <span className={isMobile ? 'flex-1' : ''}>Sell</span>
          </Link>

          {/* User Profile Link */}
          <NavLink
            href="/profile"
            className={linkClass}
            icon={faUser}
          >
            {isMobile ? (
              <>
                <span className="flex-1">Profile</span>
                <span className="text-sm text-muted-foreground group-hover:text-accent-foreground">
                  {user.email.split("@")[0]}
                </span>
              </>
            ) : (
              `Welcome, ${user.email.split("@")[0]}!`
            )}
          </NavLink>

          {/* Sign Out Button */}
          <button
            onClick={() => {
              onLinkClick();
              handleSignOut();
            }}
            className={signOutButtonClass}
            onMouseEnter={() => !isTouchDevice && setHoveredLink("signout")}
            onMouseLeave={() => !isTouchDevice && setHoveredLink(null)}
          >
            {isMobile && (
              <FontAwesomeIcon
                icon={faSignOutAlt}
                className="w-5 h-5 text-muted-foreground group-hover:text-destructive transition-colors duration-200"
              />
            )}
            <span className={isMobile ? 'flex-1' : ''}>Sign Out</span>
            {!isMobile && hoveredLink === "signout" && (
              <div className="absolute inset-0 bg-destructive/5 rounded-md -z-10 animate-pulse" />
            )}
          </button>
        </>
      ) : (
        <NavLink
          href="/auth"
          className={linkClass}
          icon={faSignInAlt}
        >
          Sign In
        </NavLink>
      )}

      {/* Seller Prompt Modal */}
      <SellerPromptModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        message={modalState.message}
        primaryAction={modalState.primaryAction}
        secondaryAction={modalState.secondaryAction}
      />
    </>
  );
});

NavLinks.displayName = 'NavLinks';

export default NavLinks;