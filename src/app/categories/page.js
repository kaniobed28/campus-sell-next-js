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
        console.log("Generated Products:", generatedProducts);

        const mappedProducts = generatedProducts.map((product, index) => ({
          ...product,
          id: product.id || `product-${index}`,
          name: product.title || "Untitled Product",
        }));

        setProducts(mappedProducts);
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

  // Group products by category and subcategory
  const categoryMap = products.reduce((acc, product) => {
    // Skip if product, category, or subcategory is invalid
    if (
      !product ||
      !product.category ||
      typeof product.category !== "string" ||
      !product.subcategory ||
      typeof product.subcategory !== "string"
    ) {
      console.log("Skipping product due to invalid category or subcategory:", product);
      return acc;
    }

    const categoryKey = product.category.trim().toLowerCase();
    const subcategoryKey = product.subcategory.trim().toLowerCase();

    if (!acc[categoryKey]) {
      acc[categoryKey] = {};
    }
    if (!acc[categoryKey][subcategoryKey]) {
      acc[categoryKey][subcategoryKey] = [];
    }
    acc[categoryKey][subcategoryKey].push(product);
    return acc;
  }, {});

  console.log("Category Map:", categoryMap);

  // Convert to sorted array format with nested subcategories
  const sortedCategories = Object.entries(categoryMap)
    .sort(([a], [b]) => {
      if (!a || !b) return 0;
      return a.localeCompare(b);
    })
    .map(([category, subcategories]) => ({
      category,
      subcategories: Object.entries(subcategories)
        .sort(([a], [b]) => {
          if (!a || !b) return 0;
          return a.localeCompare(b);
        })
        .map(([subcategory, products]) => ({
          subcategory,
          products: products
            .filter((p) => p && p.name && typeof p.name === "string")
            .sort((a, b) => {
              if (!a.name || !b.name) return 0;
              return a.name.localeCompare(b.name);
            }),
        }))
        .filter((subcat) => subcat.products.length > 0), // Remove empty subcategories
    }))
    .filter((cat) => cat.category && cat.subcategories.length > 0); // Remove empty categories

  console.log("Sorted Categories:", sortedCategories);

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
          {sortedCategories.map(({ category, subcategories }) => (
            <div
              key={category}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6"
            >
              <h2 className="text-xl font-semibold mb-4 capitalize text-gray-900">
                {category.replace(/-/g, " ")}
              </h2>
              {subcategories.map(({ subcategory, products }) => (
                <div key={subcategory} className="mb-4">
                  <h3 className="text-lg font-medium capitalize text-gray-800 mb-2">
                    {subcategory.replace(/-/g, " ")}
                  </h3>
                  <ul className="space-y-2 pl-4">
                    {products.map((product) => (
                      <li key={product.id}>
                        <Link
                          href={`/listings/${encodeURIComponent(product.id)}`}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <span className="capitalize text-gray-700">{product.name}</span>
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
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;