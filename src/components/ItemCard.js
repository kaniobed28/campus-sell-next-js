import React from "react";
import Link from "next/link";
import { Button } from "./ui/Button";
import { useViewport, useResponsiveSpacing } from "@/hooks/useViewport";
import { ProductImageContainer } from "./ResponsiveImageContainer";
import { PRODUCT_STATUS } from "@/types/admin";
import AddToBasketButton from "./AddToBasketButton";

const ItemCard = ({ 
  id, 
  image, 
  title, 
  description, 
  price, 
  link, 
  likes, 
  views, 
  status,
  variant = "default" // "default", "compact", "featured"
}) => {
  const { isMobile, isTablet, isDesktop, isTouchDevice } = useViewport();
  const spacing = useResponsiveSpacing();
  
  // Check if product is active
  const isProductActive = !status || status === PRODUCT_STATUS.ACTIVE;
  
  // Get variant-specific configurations
  const getVariantConfig = () => {
    switch (variant) {
      case "compact":
        return {
          cardPadding: "p-2 sm:p-3",
          imageHeight: "h-24 sm:h-32 md:h-36 lg:h-32",
          titleSize: "text-sm sm:text-base",
          priceSize: "text-base sm:text-lg",
          spacing: "space-y-1 sm:space-y-2",
          showDescription: false,
          showStats: false
        };
      case "featured":
        return {
          cardPadding: "p-4 sm:p-5 md:p-6",
          imageHeight: "h-40 sm:h-48 md:h-56 lg:h-48",
          titleSize: "text-lg sm:text-xl md:text-2xl",
          priceSize: "text-xl sm:text-2xl md:text-3xl",
          spacing: "space-y-3 sm:space-y-4",
          showDescription: true,
          showStats: true
        };
      default:
        return {
          cardPadding: "p-3 sm:p-4",
          imageHeight: "h-32 sm:h-40 md:h-48 lg:h-44",
          titleSize: "text-base sm:text-lg",
          priceSize: "text-lg sm:text-xl",
          spacing: "space-y-2",
          showDescription: true,
          showStats: true
        };
    }
  };
  
  const config = getVariantConfig();
  
  // Responsive touch target sizing
  const getTouchTargetClass = () => {
    return isTouchDevice ? "min-h-[44px]" : "min-h-[40px]";
  };
  
  // Adaptive image sizing based on viewport and variant
  const getImageContainerProps = () => {
    return {
      src: image,
      alt: title,
      containerClassName: `mb-3 ${variant === "featured" ? "mb-4" : ""}`,
      className: `${config.imageHeight} w-full object-cover transition-transform duration-300 group-hover:scale-105`,
      fallbackSrc: "/images/placeholder-product.jpg",
      priority: variant === "featured", // Prioritize featured images
      sizes: variant === "compact" 
        ? "(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
        : "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
    };
  };
  
  // If product is not active, don't render it
  if (!isProductActive) {
    return null;
  }
  
  return (
    <article 
      className={`
        card-base rounded-lg 
        ${config.cardPadding}
        hover:shadow-md hover:shadow-primary/10
        group transition-all duration-200 
        border border-border/50 hover:border-primary/20
        bg-card/50 hover:bg-card
        backdrop-blur-sm
        h-full flex flex-col
        ${isTouchDevice ? 'active:scale-[0.98]' : ''}
        relative
      `}
      role="article"
      aria-labelledby={`product-title-${id}`}
    >
      {/* Responsive Product Image */}
      <div className="relative">
        <ProductImageContainer {...getImageContainerProps()} />
        <AddToBasketButton 
          product={{ id, title, price, image }}
          size={variant === "compact" ? "sm" : "default"}
          showOnHover={!isTouchDevice}
          alwaysVisible={isTouchDevice}
          className="absolute top-2 right-2"
        />
      </div>
      
      {/* Product Content */}
      <div className={`${config.spacing} flex-1 flex flex-col`}>
        {/* Title */}
        <h2 
          id={`product-title-${id}`}
          className={`
            ${config.titleSize} font-semibold text-card-foreground 
            line-clamp-2 group-hover:text-primary transition-colors duration-200
            leading-tight
          `}
        >
          {title}
        </h2>
        
        {/* Price */}
        <p className={`${config.priceSize} font-bold text-primary`}>
          ${price}
        </p>

        {/* Likes and Views Section - Responsive */}
        {config.showStats && (
          <div className="flex justify-between items-center text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center gap-1 sm:gap-2">
              <span className="text-sm sm:text-base" role="img" aria-label="likes">👍</span>
              <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>
                {isMobile && likes > 999 ? `${Math.floor(likes/1000)}k` : likes}
                <span className="hidden sm:inline"> Likes</span>
              </span>
            </span>
            <span className="flex items-center gap-1 sm:gap-2">
              <span className="text-sm sm:text-base" role="img" aria-label="views">👁️</span>
              <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>
                {isMobile && views > 999 ? `${Math.floor(views/1000)}k` : views}
                <span className="hidden sm:inline"> Views</span>
              </span>
            </span>
          </div>
        )}

        {/* Description - Adaptive visibility */}
        {config.showDescription && description && (
          <p className={`
            text-xs sm:text-sm text-muted-foreground 
            line-clamp-2 leading-relaxed
            ${variant === "featured" ? "line-clamp-3" : ""}
          `}>
            {description}
          </p>
        )}

        {/* Action Button - Responsive sizing */}
        <div className={`pt-2 ${variant === "featured" ? "pt-4" : ""} mt-auto`}>
          <Button 
            asChild 
            variant="primary" 
            size={variant === "compact" ? "sm" : isMobile ? "sm" : "default"} 
            className={`
              w-full ${getTouchTargetClass()} 
              text-sm font-medium
              transition-all duration-200
              hover:shadow-md hover:shadow-primary/20
              active:scale-[0.98]
              ${variant === "featured" ? "py-3 text-base" : ""}
            `}
          >
            <Link href={link} className="flex items-center justify-center gap-2">
              <span>View Details</span>
              {variant === "featured" && !isMobile && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
};

export default ItemCard;