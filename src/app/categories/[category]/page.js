"use client";
import React from "react";
import { usePathname } from "next/navigation";
import products from "../../../dummyData/products";
import Link from "next/link";
import ItemCard from "@/components/ItemCard"; // Adjust the import path as needed

const CategoryPage = () => {
  const pathname = usePathname();
  const category = pathname.split("/").pop(); // Extract the category from the URL

  // Map products to ensure they have the expected fields
  const mappedProducts = products.map((product, index) => ({
    ...product,
    id: product.id || `product-${index}`, // Fallback ID if not present
    title: product.title || product.name || "Untitled Product", // Use title or name
    description: product.description || "No description available", // Fallback description
    price: product.price || "N/A", // Fallback price
    image: product.image || null, // Fallback for image
    likes: product.likes || 0, // Fallback for likes
    views: product.views || 0, // Fallback for views
  }));

  // Filter products by category
  const filteredProducts = mappedProducts.filter(
    (product) => product.category && product.category.toLowerCase() === category.toLowerCase()
  );

  if (!filteredProducts.length) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Category Not Found</h1>
        <Link href="/categories" className="text-blue-600 hover:underline">
          Back to Categories
        </Link>
      </div>
    );
  }

  // Group filtered products by subcategory
  const subcategoryMap = filteredProducts.reduce((acc, product) => {
    if (!product || !product.subcategory || typeof product.subcategory !== "string") {
      console.log("Skipping product due to invalid subcategory:", product);
      return acc;
    }

    const subcategoryKey = product.subcategory.trim().toLowerCase();
    if (!acc[subcategoryKey]) {
      acc[subcategoryKey] = [];
    }
    acc[subcategoryKey].push(product);
    return acc;
  }, {});

  // Convert to sorted array format
  const sortedSubcategories = Object.entries(subcategoryMap)
    .sort(([a], [b]) => {
      if (!a || !b) return 0;
      return a.localeCompare(b);
    })
    .map(([subcategory, products]) => ({
      subcategory,
      products: products
        .filter((p) => p && p.title && typeof p.title === "string")
        .sort((a, b) => {
          if (!a.title || !b.title) return 0;
          return a.title.localeCompare(b.title);
        }),
    }))
    .filter((subcat) => subcat.subcategory && subcat.products.length > 0);

  console.log("Sorted Subcategories:", sortedSubcategories);

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </h1>
      {sortedSubcategories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No subcategories available</p>
          <Link href="/categories" className="text-blue-600 hover:underline">
            Back to Categories
          </Link>
        </div>
      ) : (
        <div>
          {sortedSubcategories.map(({ subcategory, products }) => (
            <div key={subcategory} className="mb-10">
              <h2 className="text-2xl font-semibold mb-6 capitalize text-gray-800">
                {subcategory.replace(/-/g, " ")} ({products.length} {products.length === 1 ? "item" : "items"})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ItemCard
                    key={product.id}
                    id={product.id}
                    image={product.image}
                    title={product.title}
                    description={product.description}
                    price={product.price}
                    link={`/listings/${encodeURIComponent(product.id)}`}
                    likes={product.likes}
                    views={product.views}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;