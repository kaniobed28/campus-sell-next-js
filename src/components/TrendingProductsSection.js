import React from "react";
import ProductGrid from "./ProductGrid";
import products from "@/dummyData/products"; // Import products from dummy data
import { useResponsiveSpacing } from "@/hooks/useViewport";

const TrendingProductsSection = () => {
  const spacing = useResponsiveSpacing();
  
  // Sort products by likes in descending order and take the top 6
  const trendingProducts = [...products]
    .sort((a, b) => (b.likes || 0) - (a.likes || 0)) // Handle undefined likes
    .slice(0, 6)
    .map((product) => ({
      ...product,
      // Normalize image: use first URL from imageUrls if present, otherwise use image
      image: Array.isArray(product.imageUrls) && product.imageUrls.length > 0
        ? product.imageUrls[0]
        : product.image || "/default-image.jpg",
      description: product.subtype || product.category || "No subtype", // Fallback for subtype
      price: Number(product.price).toFixed(2), // Ensure price is a formatted number
      link: `/listings/${product.id}`,
      likes: product.likes || 0, // Default to 0 if not provided
      views: product.views || 0 // Default to 0 if not provided
    }));

  return (
    <section className="py-12 sm:py-16 bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark">
      <div className={`container mx-auto ${spacing.container}`}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
          Trending Products
        </h2>
        <ProductGrid 
          products={trendingProducts}
          emptyStateMessage="No trending products available"
          emptyStateIcon="🔥"
        />
      </div>
    </section>
  );
};

export default TrendingProductsSection;