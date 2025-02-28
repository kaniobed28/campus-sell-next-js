"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import generateProducts from "@/dummyData/generateProducts";
import Loading from "@/components/Loading";

const CategoriesPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const generatedProducts = await generateProducts();
        setProducts(generatedProducts);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (!products || products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">No Products Found</h1>
        <p className="text-gray-600">Please check back later.</p>
      </div>
    );
  }

  // Create category structure from Firestore data
  const categoryMap = products.reduce((acc, product) => {
    if (product.category && product.subcategory) {
      const categoryKey = product.category.trim().toLowerCase();
      const subtypeValue = product.subcategory.trim().toLowerCase();
      
      if (!acc[categoryKey]) {
        acc[categoryKey] = new Set();
      }
      acc[categoryKey].add(subtypeValue);
    }
    return acc;
  }, {});

  // Convert to sorted array format
  const sortedCategories = Object.entries(categoryMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, subtypes]) => ({
      category,
      subtypes: Array.from(subtypes).sort((a, b) => a.localeCompare(b))
    }));

  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Product Categories</h1>
        <p className="text-gray-600">Browse through our product collections</p>
      </div>

      {sortedCategories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-600">No categories available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCategories.map(({ category, subtypes }) => (
            <div 
              key={category}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6"
            >
              <h2 className="text-xl font-semibold mb-4 capitalize text-gray-900">
                {category.replace(/-/g, ' ')}
              </h2>
              <ul className="space-y-3">
                {subtypes.map((subtype) => (
                  <li key={subtype}>
                    <Link
                      href={`/categories/${encodeURIComponent(category)}/${encodeURIComponent(subtype)}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <span className="capitalize text-gray-700">
                        {subtype.replace(/-/g, ' ')}
                      </span>
                      <svg 
                        className="w-5 h-5 text-gray-400" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M9 5l7 7-7 7" 
                        />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
