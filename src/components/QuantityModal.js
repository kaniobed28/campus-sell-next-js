"use client";

import React, { useEffect, useRef } from "react";
import { useViewport } from "@/hooks/useViewport";

const QuantityModal = ({ 
  isOpen, 
  productName, 
  quantity, 
  setQuantity, 
  onConfirm, 
  onClose, 
  isLoading,
  maxQuantity = 999,
  existingQuantity = 0,
  productPrice = null
}) => {
  const { isMobile, isTouchDevice } = useViewport();
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      
      // Focus the input when modal opens
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle click outside
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // Handle quantity change with validation
  const handleQuantityChange = (newQuantity) => {
    const validQuantity = Math.max(1, Math.min(maxQuantity, parseInt(newQuantity) || 1));
    setQuantity(validQuantity);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isLoading) {
      onConfirm();
    }
  };

  if (!isOpen) return null;

  const totalQuantity = existingQuantity + quantity;
  const totalPrice = productPrice ? (productPrice * quantity).toFixed(2) : null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quantity-modal-title"
    >
      <div 
        ref={modalRef}
        className={`
          bg-card border border-border rounded-lg shadow-xl w-full max-w-sm
          transform transition-all duration-200 scale-100
          ${isMobile ? 'mx-4' : ''}
        `}
      >
        <form onSubmit={handleSubmit} className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h3 
              id="quantity-modal-title"
              className="text-xl font-semibold text-card-foreground mb-2"
            >
              Add to Basket
            </h3>
            <p className="text-muted-foreground">
              How many &quot;{productName}&quot; would you like to add?
            </p>
            {existingQuantity > 0 && (
              <p className="text-sm text-primary mt-1">
                You already have {existingQuantity} in your basket
              </p>
            )}
          </div>
          
          {/* Quantity Selector */}
          <div className="mb-6">
            <label htmlFor="quantity-input" className="block text-sm font-medium mb-2">
              Quantity
            </label>
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className={`
                  ${isTouchDevice ? 'w-12 h-12' : 'w-10 h-10'}
                  bg-accent hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors flex items-center justify-center text-lg font-medium
                  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset
                `}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <input
                ref={inputRef}
                id="quantity-input"
                type="number"
                min="1"
                max={maxQuantity}
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className={`
                  flex-1 text-center text-lg font-medium bg-transparent border-0
                  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset
                  ${isTouchDevice ? 'py-3' : 'py-2'}
                `}
                aria-label={`Quantity (current: ${quantity})`}
              />
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= maxQuantity}
                className={`
                  ${isTouchDevice ? 'w-12 h-12' : 'w-10 h-10'}
                  bg-accent hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors flex items-center justify-center text-lg font-medium
                  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset
                `}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            
            {/* Quantity info */}
            <div className="mt-2 text-sm text-muted-foreground space-y-1">
              {totalQuantity > existingQuantity && (
                <p>Total in basket will be: {totalQuantity}</p>
              )}
              {totalPrice && (
                <p>Subtotal: ${totalPrice}</p>
              )}
              {quantity >= maxQuantity && (
                <p className="text-warning">Maximum quantity reached</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className={`flex gap-3 ${isMobile ? 'flex-col-reverse' : 'justify-between'}`}>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className={`
                px-6 py-2 bg-secondary text-secondary-foreground rounded-lg
                hover:bg-secondary/80 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2
                ${isMobile ? 'w-full' : ''}
                ${isTouchDevice ? 'min-h-[44px]' : ''}
              `}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || quantity < 1}
              className={`
                px-6 py-2 bg-primary text-primary-foreground rounded-lg
                hover:bg-primary/90 transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                ${isMobile ? 'w-full' : ''}
                ${isTouchDevice ? 'min-h-[44px]' : ''}
                ${isLoading ? '' : 'hover:scale-105 active:scale-95'}
              `}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                  Adding...
                </div>
              ) : (
                `Add ${quantity} to Basket`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuantityModal;
