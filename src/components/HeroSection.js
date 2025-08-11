// src/components/HeroSection.js
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import SearchBar from "./SearchBar";
import { Section, Container, Grid, Stack, Flex } from "./layout";
import { useViewport, useResponsiveSpacing } from "@/hooks/useViewport";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [products, setProducts] = useState([]);
  const router = useRouter();
  const { isMobile, isTablet, isDesktop } = useViewport();
  const spacing = useResponsiveSpacing();

  // Mock product data (replace with Firebase fetch later)
  useEffect(() => {
    const mockProducts = [
      { id: "5kztIYBg2MLeVlwIXine", title: "54y4t", price: 45, category: "Home" },
      { id: "CLvDfuyypdTaIbHU3SZA", title: "Laptop", price: 800, category: "Electronics" },
    ];
    setProducts(mockProducts);
  }, []);

  return (
    <section className="bg-gradient-to-br from-background to-muted py-12 sm:py-16 md:py-20 lg:py-24 theme-transition">
      <div className={`container mx-auto ${spacing.container} text-center`}>
        <div className="max-w-4xl mx-auto">
          {/* Responsive heading with improved mobile sizing */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 text-foreground leading-tight">
            Welcome to{" "}
            <span className="text-primary bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Campus Sell
            </span>
          </h1>
          
          {/* Responsive subtitle with better mobile readability */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
            Buy, sell, and trade within your campus community. 
            Discover great deals from fellow students.
          </p>
          
          {/* Hero Search Bar with responsive sizing */}
          <div className="max-w-xs sm:max-w-sm md:max-w-lg mx-auto mb-6 sm:mb-8 px-2 sm:px-0">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isSearching={isSearching}
              setIsSearching={setIsSearching}
              products={products}
            />
          </div>

          {/* Call-to-action buttons with improved mobile touch targets */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 md:mb-16">
            <Button 
              asChild 
              variant="primary" 
              size={isMobile ? "default" : "lg"}
              className="w-full sm:w-auto min-w-[160px] min-h-[48px] text-base font-medium"
            >
              <a href="/listings">Browse Items</a>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size={isMobile ? "default" : "lg"}
              className="w-full sm:w-auto min-w-[160px] min-h-[48px] text-base font-medium"
            >
              <a href="/sell">Start Selling</a>
            </Button>
          </div>

          {/* Feature highlights with responsive grid and improved mobile layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 text-left">
            <div className="card-base p-4 sm:p-6 rounded-lg text-center hover:shadow-lg transition-shadow duration-300">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🛍️</div>
              <h3 className="text-base sm:text-lg font-semibold mb-2 text-card-foreground">Easy Shopping</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Browse thousands of items from your campus community
              </p>
            </div>
            <div className="card-base p-4 sm:p-6 rounded-lg text-center hover:shadow-lg transition-shadow duration-300">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">💰</div>
              <h3 className="text-base sm:text-lg font-semibold mb-2 text-card-foreground">Great Deals</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Find amazing prices on textbooks, electronics, and more
              </p>
            </div>
            <div className="card-base p-4 sm:p-6 rounded-lg text-center hover:shadow-lg transition-shadow duration-300 sm:col-span-2 md:col-span-1">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🤝</div>
              <h3 className="text-base sm:text-lg font-semibold mb-2 text-card-foreground">Safe Trading</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Trade safely within your trusted campus community
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;