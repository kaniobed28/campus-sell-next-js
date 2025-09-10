import React from 'react';
import Link from 'next/link';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useBasketStore } from '@/stores/useBasketStore';

const BasketCounter = () => {
  const { totalItems } = useBasketStore();
  
  if (totalItems === 0) {
    return null;
  }
  
  return (
    <Link 
      href="/basket" 
      className="relative p-2 rounded-full hover:bg-accent transition-colors duration-200"
      aria-label={`Basket with ${totalItems} items`}
    >
      <ShoppingCartIcon className="w-5 h-5 text-foreground" />
      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
        {totalItems > 99 ? '99+' : totalItems}
      </span>
    </Link>
  );
};

export default BasketCounter;