"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import SellerPromptModal from "./SellerPromptModal";

const NavLinks = ({ user, handleSignOut, onLinkClick, isMobile = false }) => {
  const router = useRouter();
  const [modalState, setModalState] = useState({
    isOpen: false,
    message: "",
    primaryAction: null,
    secondaryAction: null,
  });

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
        onClick: () => {},
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

  const linkClass = isMobile
    ? "text-lg hover:text-secondary transition dark:hover:text-secondary-dark"
    : "hover:text-secondary transition dark:hover:text-secondary-dark";

  const sellButtonClass = isMobile
    ? "px-6 py-2 bg-accent text-background rounded-lg hover:bg-accent-dark transition dark:bg-accent-dark dark:text-background-dark"
    : "px-4 py-2 bg-accent text-background rounded-lg hover:bg-accent-dark transition shadow-md dark:bg-accent-dark dark:text-background-dark";

  return (
    <>
      <Link href="/categories" className={linkClass} onClick={onLinkClick}>
        Categories
      </Link>
      <Link href="/listings" className={linkClass} onClick={onLinkClick}>
        Listings
      </Link>
      <Link href="/setup" className={linkClass} onClick={onLinkClick}>
        Setup
      </Link>
      <Link href="/contact" className={linkClass} onClick={onLinkClick}>
        Contact Us
      </Link>
      {user ? (
        <>
          <Link href="/sell" onClick={handleSellClick} className={sellButtonClass}>
            Sell
          </Link>
          <Link href="/profile" className={linkClass} onClick={onLinkClick}>
            <span>Welcome, {user.email.split("@")[0]}!</span>
          </Link>
          <button
            onClick={() => {
              onLinkClick();
              handleSignOut();
            }}
            className="text-danger hover:text-danger-dark transition"
          >
            Sign Out
          </button>
        </>
      ) : (
        <Link href="/auth" className={linkClass} onClick={onLinkClick}>
          Sign In
        </Link>
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
};

export default NavLinks;