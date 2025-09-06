import React, { useState, useEffect } from "react";
import ProductGrid from "./ProductGrid";
import { useViewport, useResponsiveSpacing } from "@/hooks/useViewport";
import { realtimeProductService } from "@/services/realtimeProductService";
import { PRODUCT_STATUS } from "@/types/admin";

const FeaturedListingsSection = () => {
  const { isMobile, isTablet, isDesktop } = useViewport();
  const spacing = useResponsiveSpacing();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Adaptive product count based on screen size
  const getProductCount = () => {
    if (isMobile) return 4;
    if (isTablet) return 6;
    return 8;
  };
  
  useEffect(() => {
    // Subscribe to real-time active products
    const unsubscribe = realtimeProductService.subscribeToActiveProducts((productsData) => {
      // Sort products by views in descending order and take responsive amount
      const topLikedProducts = [...productsData]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, getProductCount())
        .map((item) => ({
          ...item,
          // Normalize image: use first URL from imageUrls if present, otherwise use image
          image: Array.isArray(item.imageUrls) && item.imageUrls.length > 0
            ? item.imageUrls[0]
            : item.image || "/default-image.jpg",
          description: item.category || item.description || "No category",
          link: `/listings/${item.id}`,
          likes: item.likes || 0,
          views: item.views || 0
        }));
      
      setProducts(topLikedProducts);
      setLoading(false);
    });
    
    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [isMobile, isTablet, isDesktop]);

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background text-foreground theme-transition">
      <div className={`container mx-auto ${spacing.container}`}>
        {/* Responsive heading */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-foreground">
            Featured Listings
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
            Discover the most popular items in your campus community
          </p>
        </div>
        
        {/* Enhanced responsive product grid */}
        <ProductGrid 
          products={products}
          emptyStateMessage="No featured listings available"
          emptyStateIcon="⭐"
          variant="featured"
        />
        
        {/* View more link for mobile users */}
        {isMobile && products.length >= 4 && (
          <div className="text-center mt-6">
            <a
              href="/listings"
              className="inline-flex items-center text-primary hover:text-accent theme-transition font-medium py-2 px-4 rounded-lg hover:bg-primary/10 min-h-[44px]"
            >
              View More Listings
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedListingsSection;