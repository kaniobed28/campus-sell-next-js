// src/components/HeroSection.js
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import SearchBar from "./SearchBar";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [products, setProducts] = useState([]);
  const router = useRouter();

  // Mock product data (replace with Firebase fetch later)
  useEffect(() => {
    const mockProducts = [
      { id: "5kztIYBg2MLeVlwIXine", title: "54y4t", price: 45, category: "Home" },
      { id: "CLvDfuyypdTaIbHU3SZA", title: "Laptop", price: 800, category: "Electronics" },
    ];
    setProducts(mockProducts);
  }, []);

  return (
    <section className="bg-gradient-to-br from-background to-muted py-20 theme-transition">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            Welcome to{" "}
            <span className="text-primary bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Campus Sell
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-2xl mx-auto">
            Buy, sell, and trade within your campus community. 
            Discover great deals from fellow students.
          </p>
          
          {/* Hero Search Bar */}
          <div className="max-w-lg mx-auto mb-8">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isSearching={isSearching}
              setIsSearching={setIsSearching}
              products={products}
            />
          </div>

          {/* Call-to-action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              asChild 
              variant="primary" 
              size="lg"
              className="min-w-[160px]"
            >
              <a href="/listings">Browse Items</a>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="min-w-[160px]"
            >
              <a href="/sell">Start Selling</a>
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
            <div className="card-base p-6 rounded-lg text-center">
              <div className="text-4xl mb-4">🛍️</div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">Easy Shopping</h3>
              <p className="text-muted-foreground text-sm">
                Browse thousands of items from your campus community
              </p>
            </div>
            <div className="card-base p-6 rounded-lg text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">Great Deals</h3>
              <p className="text-muted-foreground text-sm">
                Find amazing prices on textbooks, electronics, and more
              </p>
            </div>
            <div className="card-base p-6 rounded-lg text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">Safe Trading</h3>
              <p className="text-muted-foreground text-sm">
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