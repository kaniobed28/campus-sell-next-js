"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBasketStore } from "../stores/useBasketStore";
import { useAuth } from "../stores/useAuth";
import { useViewport } from "@/hooks/useViewport";
import { useResponsiveTypography } from "@/hooks/useResponsiveTypography";
import BasketItem from "@/components/BasketItem";
import Loading from "@/components/Loading";

const BasketPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const basketStore = useBasketStore();
  const { isMobile, isTablet, isTouchDevice } = useViewport();
  const { getResponsiveTextClass, getResponsiveHeadingClass } = useResponsiveTypography();

  // Initialize basket when component mounts
  useEffect(() => {
    if (!authLoading) {
      basketStore.initializeBasket().catch(error => {
        console.error("Failed to initialize basket:", error);
      });
    }
  }, [authLoading]);

  // Handle authentication redirect for authenticated-only features
  // Note: Guest users can still use the basket
  const isAuthenticated = !!user;
  const basketItems = basketStore.getAllItems();

  // Handle quantity change
  const handleQuantityChange = async (itemId, newQuantity) => {
    try {
      await basketStore.updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  // Handle remove item
  const handleRemoveItem = async (itemId) => {
    try {
      await basketStore.removeFromBasket(itemId);
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    if (basketItems.length === 0) {
      alert("Your basket is empty. Add items before checking out.");
      return;
    }
    
    // Redirect to auth if not authenticated
    if (!isAuthenticated) {
      router.push("/auth?redirect=/basket/checkout");
      return;
    }
    
    router.push("/basket/checkout");
  };

  // Handle clear basket
  const handleClearBasket = async () => {
    const confirmed = window.confirm("Are you sure you want to clear your entire basket?");
    if (!confirmed) return;

    try {
      await basketStore.clearBasket();
    } catch (error) {
      console.error("Error clearing basket:", error);
    }
  };

  // Loading state
  if (authLoading || (basketStore.isLoading && basketItems.length === 0)) {
    return <Loading />;
  }

  // Responsive classes
  const containerClasses = `
    min-h-screen bg-gray-50
    ${isMobile ? 'pb-20' : 'pb-8'}
  `;

  const mainContainerClasses = `
    container mx-auto 
    ${isMobile ? 'px-4' : isTablet ? 'px-6' : 'px-8'}
    ${isMobile ? 'py-4' : 'py-8'}
  `;

  const summaryCardClasses = `
    bg-white border border-gray-200 rounded-lg 
    ${isMobile ? 'p-4' : 'p-6'} mb-6
  `;

  const checkoutButtonClasses = `
    ${isMobile ? 'w-full px-6 py-4' : 'px-8 py-3'} 
    bg-blue-600 text-white font-semibold rounded-lg 
    hover:bg-blue-700 transition-colors 
    disabled:opacity-50 disabled:cursor-not-allowed
    ${isTouchDevice ? 'min-h-[48px] active:scale-95' : 'min-h-[44px]'}
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  `;

  const clearButtonClasses = `
    ${isMobile ? 'px-4 py-2' : 'px-3 py-1'} 
    ${getResponsiveTextClass('body-sm')} text-red-600 
    hover:text-red-700 hover:bg-red-50 rounded-md transition-colors
    ${isTouchDevice ? 'min-h-[44px] active:scale-95' : ''}
    focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
  `;

  return (
    <div className={containerClasses}>
      <div className={mainContainerClasses}>
        {/* Header */}
        <div className={`mb-6 ${isMobile ? 'text-center' : ''}`}>
          <h1 className={`${getResponsiveHeadingClass(1, 'display')} text-gray-900 mb-4`}>
            Your Basket
          </h1>
          
          {/* Basket Summary */}
          {basketItems.length > 0 && (
            <div className={summaryCardClasses}>
              <div className={`flex items-center ${isMobile ? 'flex-col gap-4' : 'justify-between'}`}>
                <div className={isMobile ? 'text-center' : ''}>
                  <p className={`${getResponsiveTextClass('body-base')} text-gray-600`}>
                    {basketStore.itemCount} items • Total: ${basketStore.totalPrice.toFixed(2)}
                  </p>
                  {!isAuthenticated && (
                    <p className={`${getResponsiveTextClass('body-sm')} text-blue-600 mt-1`}>
                      Sign in to save your basket and checkout
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearBasket}
                    className={clearButtonClasses}
                  >
                    Clear Basket
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {basketItems.length > 0 ? (
          <>
            {/* Basket Items */}
            <div className={`space-y-4 mb-8 ${isMobile ? 'space-y-3' : ''}`}>
              {basketItems.map((item) => (
                <BasketItem
                  key={item.id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemoveItem}
                  isUpdating={basketStore.isLoading}
                />
              ))}
            </div>

            {/* Checkout Section */}
            <div className={summaryCardClasses}>
              <div className={`flex items-center ${isMobile ? 'flex-col gap-4' : 'justify-between'}`}>
                <div className={isMobile ? 'text-center' : ''}>
                  <div className={`${getResponsiveTextClass('heading-2')} font-bold text-gray-900`}>
                    Total: ${basketStore.totalPrice.toFixed(2)}
                  </div>
                  <div className={`${getResponsiveTextClass('body-base')} text-gray-600`}>
                    {basketStore.itemCount} items
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={basketStore.isLoading}
                  className={checkoutButtonClasses}
                >
                  {basketStore.isLoading ? "Processing..." : "Proceed to Checkout"}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty Basket State */
          <div className={`text-center ${isMobile ? 'py-12' : 'py-16'}`}>
            <div className={`${isMobile ? 'w-16 h-16' : 'w-24 h-24'} mx-auto mb-6 text-gray-400`}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h7M9.5 18a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm7 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              </svg>
            </div>
            <h2 className={`${getResponsiveHeadingClass(2)} text-gray-900 mb-2`}>
              Your basket is empty
            </h2>
            <p className={`${getResponsiveTextClass('body-base')} text-gray-600 mb-6`}>
              Discover amazing products from fellow students
            </p>
            <button
              onClick={() => router.push("/")}
              className={`
                ${isMobile ? 'w-full px-6 py-4' : 'px-6 py-3'} 
                bg-blue-600 text-white font-semibold rounded-lg 
                hover:bg-blue-700 transition-colors
                ${isTouchDevice ? 'min-h-[48px] active:scale-95' : 'min-h-[44px]'}
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              `}
            >
              Start Shopping
            </button>
          </div>
        )}

        {/* Error Display */}
        {basketStore.error && (
          <div className={`
            fixed ${isMobile ? 'bottom-4 left-4 right-4' : 'bottom-4 right-4'} 
            bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg 
            ${isMobile ? 'max-w-none' : 'max-w-sm'}
          `}>
            <div className="flex items-start gap-3">
              <div className="text-red-600 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className={`${getResponsiveTextClass('body-sm')} text-red-800`}>
                  {basketStore.error}
                </p>
                <button
                  onClick={() => basketStore.clearError()}
                  className={`
                    ${getResponsiveTextClass('body-xs')} text-red-600 
                    hover:text-red-800 mt-1 underline
                    ${isTouchDevice ? 'min-h-[44px] py-2' : ''}
                    focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded
                  `}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BasketPage;



<<<<<<< HEAD

=======
>>>>>>> 9729b63 (bug space added 2 time)
