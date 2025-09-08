import React, { useEffect, useState } from "react";
import Link from "next/link";
import useCategoryStore from "@/stores/useCategoryStore";
import { useViewport, useResponsiveSpacing } from "@/hooks/useViewport";

// Fallback categories for when database is empty
const fallbackCategories = [
  {
    name: "Electronics",
    icon: "💻",
    types: ["Laptops", "Phones", "Tablets", "Accessories"],
    color: "from-blue-500 to-purple-600",
    slug: "electronics",
  },
  {
    name: "Fashion",
    icon: "👕",
    types: ["Men's Wear", "Women's Wear", "Shoes", "Accessories"],
    color: "from-pink-500 to-rose-600",
    slug: "fashion",
  },
  {
    name: "Food",
    icon: "🍕",
    types: ["Groceries", "Snacks", "Drinks", "Prepared Meals"],
    color: "from-orange-500 to-red-600",
    slug: "food",
  },
  {
    name: "Services",
    icon: "🛠️",
    types: ["Tutoring", "Repairs", "Cleaning", "Events"],
    color: "from-green-500 to-teal-600",
    slug: "services",
  },
];

const CategoriesSection = () => {
  const { categoryTree, fetchCategoryTree } = useCategoryStore();
  const [displayCategories, setDisplayCategories] = useState(fallbackCategories);
  const { isMobile, isTablet, isDesktop } = useViewport();
  const spacing = useResponsiveSpacing();

  useEffect(() => {
    fetchCategoryTree();
  }, [fetchCategoryTree]);

  useEffect(() => {
    if (categoryTree && categoryTree.length > 0) {
      // Use real categories from database, limit based on screen size
      const categoryLimit = isMobile ? 4 : isTablet ? 6 : 8;
      const realCategories = categoryTree.slice(0, categoryLimit).map((category, index) => ({
        name: category.name,
        icon: category.icon || fallbackCategories[index]?.icon || "📁",
        types: category.children.map(child => child.name).slice(0, 4),
        color: fallbackCategories[index]?.color || "from-gray-500 to-gray-600",
        slug: category.slug,
        productCount: category.metadata.productCount + 
          category.children.reduce((sum, child) => sum + child.metadata.productCount, 0),
      }));
      setDisplayCategories(realCategories);
    }
  }, [categoryTree, isMobile, isTablet]);

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background theme-transition">
      <div className={`container mx-auto ${spacing.container}`}>
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-foreground">
            Explore Categories
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
            Discover what your campus community has to offer across different categories
          </p>
        </div>
        
        {/* Responsive grid: 2 cols mobile, 3 cols tablet, 4 cols desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {displayCategories.map((category, index) => (
            <Link
              href={`/categories/${category.slug}`}
              key={index}
              className="group card-base rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 text-center hover:shadow-lg theme-transition transform hover:-translate-y-1 min-h-[120px] sm:min-h-[140px] md:min-h-[160px] flex flex-col justify-center"
            >
              <div className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                {category.icon}
              </div>
              <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-1 sm:mb-2 text-card-foreground group-hover:text-primary theme-transition leading-tight">
                {category.name}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
                {category.types.length} subcategories
              </p>
              
              {/* Show subcategories only on larger screens */}
              {!isMobile && (
                <div className="text-xs text-muted-foreground leading-tight">
                  {category.types.slice(0, 2).join(", ")}
                  {category.types.length > 2 && "..."}
                </div>
              )}
              
              {/* Product count with responsive visibility */}
              {category.productCount > 0 && (
                <div className="mt-1 sm:mt-2 text-xs text-primary font-medium">
                  {category.productCount} products
                </div>
              )}
            </Link>
          ))}
        </div>
        
        {/* View all link with improved touch target */}
        <div className="text-center mt-6 sm:mt-8">
          <Link
            href="/categories"
            className="inline-flex items-center text-primary hover:text-accent theme-transition font-medium py-2 px-4 rounded-lg hover:bg-primary/10 min-h-[44px]"
          >
            View All Categories
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
