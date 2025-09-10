import React from 'react';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useBasketStore } from '@/stores/useBasketStore';
import { NotificationService } from '@/services/notificationService';

const AddToBasketButton = ({ 
  product, 
  quantity = 1, 
  size = 'default', 
  variant = 'primary',
  className = '',
  showIcon = true,
  showOnHover = false,
  alwaysVisible = false,
  children
}) => {
  const { addToBasket, syncBasket } = useBasketStore();
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    default: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
  };
  
  const handleAddToBasket = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product || !product.id) {
      NotificationService.error('Invalid product data');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Add to local store
      addToBasket(product, quantity);
      
      // Show success notification
      NotificationService.basketItemAdded(product.title || product.name || 'Product', quantity);
    } catch (error) {
      console.error('Error adding to basket:', error);
      NotificationService.basketError('Failed to add item to basket');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <button
      onClick={handleAddToBasket}
      disabled={isLoading}
      className={`
        inline-flex items-center justify-center rounded-md font-medium
        transition-colors focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-ring focus-visible:ring-offset-2
        disabled:opacity-50 disabled:pointer-events-none
        ring-offset-background
        ${showOnHover ? 'opacity-0 group-hover:opacity-100 transition-opacity duration-200' : ''}
        ${alwaysVisible ? 'opacity-100' : ''}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      aria-label={`Add ${product.title || product.name || 'product'} to basket`}
    >
      {isLoading ? (
        <span className="flex items-center">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2"></span>
          Adding...
        </span>
      ) : (
        <>
          {showIcon && <ShoppingCartIcon className="w-4 h-4 mr-2" />}
          {children || 'Add to Basket'}
        </>
      )}
    </button>
  );
};

export default AddToBasketButton;