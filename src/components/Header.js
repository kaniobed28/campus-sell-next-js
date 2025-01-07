"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); // Cleanup listener
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
    <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-3xl font-bold tracking-wide hover:text-gray-300 transition"
        >
          Campus Sell
        </Link>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 mx-6">
          <input
            type="text"
            placeholder="Search for products, categories..."
            className="w-full px-4 py-2 rounded-l-lg border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
          />
          <button className="px-6 bg-green-500 text-white rounded-r-lg hover:bg-green-600 transition-all shadow-md">
            Search
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/categories" className="hover:text-gray-300 transition">
            Categories
          </Link>
          <Link href="/listings" className="hover:text-gray-300 transition">
            My Listings
          </Link>
          <Link href="/contact" className="hover:text-gray-300 transition">
            Contact Us
          </Link>
          {user ? (
            <>
              <Link
                href="/sell"
                className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition shadow-md"
              >
                Sell
              </Link>
              <span className="text-gray-300">Welcome, {user.email.split("@")[0]}!</span>
              <button
                onClick={handleSignOut}
                className="text-red-400 hover:text-red-600 transition"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/auth" className="hover:underline">
              Sign In
            </Link>
          )}
        </nav>

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
        className={`md:hidden fixed top-0 left-0 w-full h-full bg-blue-900 bg-opacity-95 text-white transform ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-50`}
      >
        <div className="flex flex-col items-center space-y-6 py-8">
          <button
            className="absolute top-4 right-4 text-white text-2xl"
            onClick={() => setIsMenuOpen(false)}
          >
            ✕
          </button>
          <Link
            href="/categories"
            className="text-lg hover:text-gray-300 transition"
            onClick={() => setIsMenuOpen(false)}
          >
            Categories
          </Link>
          <Link
            href="/listings"
            className="text-lg hover:text-gray-300 transition"
            onClick={() => setIsMenuOpen(false)}
          >
            My Listings
          </Link>
          <Link
            href="/contact"
            className="text-lg hover:text-gray-300 transition"
            onClick={() => setIsMenuOpen(false)}
          >
            Contact Us
          </Link>
          {user ? (
            <>
              <Link
                href="/sell"
                className="px-6 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Sell
              </Link>
              <span className="text-lg">Welcome, {user.email.split("@")[0]}!</span>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleSignOut();
                }}
                className="text-red-400 hover:text-red-600 transition"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className="text-lg hover:underline"
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
