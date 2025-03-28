"use client";

import React from "react";
import NavLinks from "./NavLinks";

const MobileMenu = ({ isMenuOpen, setIsMenuOpen, user, handleSignOut }) => {
  return (
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
        <NavLinks
          user={user}
          handleSignOut={handleSignOut}
          onLinkClick={() => setIsMenuOpen(false)}
          isMobile={true}
        />
      </div>
    </div>
  );
};

export default MobileMenu;