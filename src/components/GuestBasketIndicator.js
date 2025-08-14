"use client";

import React from "react";
import Link from "next/link";
import { useUnifiedBasket } from "@/hooks/useUnifiedBasket";

const GuestBasketIndicator = ({ className = "" }) => {
  const { isGuestMode, totalItems, isLoading } = useUnifiedBasket();

  // Only show for guest users with items
  if (!isGuestMode || totalItems === 0 || isLoading) {
    return null;
  }

  return (
    <Link 
      href="/basket"
      className={`
        inline-flex items-center gap-2 px-3 py-2 
        bg-blue-600 text-white rounded-lg hover:bg-blue-700 
        transition-colors text-sm font-medium
        ${className}
      `}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h7M9.5 18a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm7 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
      <span>Basket ({totalItems})</span>
    </Link>
  );
};

export default GuestBasketIndicator;