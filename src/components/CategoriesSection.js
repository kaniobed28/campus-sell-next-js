import React, { useEffect, useState } from "react";
import Link from "next/link";
import useCategoryStore from "@/stores/useCategoryStore";

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

  useEffect(() => {
    fetchCategoryTree();
  }, [fetchCategoryTree]);

  useEffect(() => {
    if (categoryTree && categoryTree.length > 0) {
      // Use real categories from database, limit to first 4 for homepage
      const realCategories = categoryTree.slice(0, 4).map((category, index) => ({
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
  }, [categoryTree]);

  return (
    <section className="py-16 bg-background theme-transition">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Explore Categories
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover what your campus community has to offer across different categories
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {displayCategories.map((category, index) => (
            <Link
              href={`/categories/${category.slug}`}
              key={index}
              className="group card-base rounded-xl p-6 text-center hover:shadow-lg theme-transition transform hover:-translate-y-1"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {category.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2 text-card-foreground group-hover:text-primary theme-transition">
                {category.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {category.types.length} subcategories
              </p>
              <div className="mt-3 text-xs text-muted-foreground">
                {category.types.slice(0, 2).join(", ")}
                {category.types.length > 2 && "..."}
              </div>
              {category.productCount > 0 && (
                <div className="mt-2 text-xs text-primary">
                  {category.productCount} products
                </div>
              )}
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Link
            href="/categories"
            className="inline-flex items-center text-primary hover:text-accent theme-transition font-medium"
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
