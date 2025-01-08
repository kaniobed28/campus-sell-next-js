"use client";
import React, { useEffect } from "react";
import { useProductStore } from "../stores/useProductStore";
import ProductsSidebar from "../../components/ProductsSideBar";
import ItemCard from "../../components/ItemCard";
<<<<<<< HEAD
import Loading from "@/components/Loading";
=======
>>>>>>> bc6417a (feature 02 product side bar)

export default function ProductsPage() {
  const {
    filteredProducts,
    fetchProducts,
    applyFilters,
    loading,
    filters, // To monitor changes in filters
  } = useProductStore();

  // Fetch products from Firebase when the component mounts
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [applyFilters, filters]); // Depend on filters to reapply filters when they change

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Sidebar */}
      <ProductsSidebar />

      {/* Product Grid */}
      <main className="flex-1 p-4">
        {loading ? (
          <Loading />
        ) : filteredProducts.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-lg font-semibold text-gray-500">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
<<<<<<< HEAD
            {filteredProducts.map((product) => {
              // Normalize image: use first URL from imageUrls if present, otherwise use image
              const displayImage =
                Array.isArray(product.imageUrls) && product.imageUrls.length > 0
                  ? product.imageUrls[0]
                  : product.image || "/default-image.jpg";

              return (
                <ItemCard
                  key={product.id}
                  id={product.id}
                  image={displayImage} // Pass normalized image
                  title={product.name}
                  description={product.category}
                  price={product.price}
                  link={`/listings/${product.id}`}
                  likes={product.likes || 0} // Default to 0 if not provided
                  views={product.views || 0} // Default to 0 if not provided
                />
              );
            })}
=======
            {filteredProducts.map((product) => (
              <ItemCard
                key={product.id}
                id={product.id}
                image={product.image}
                title={product.name}
                description={product.category}
                price={product.price}
                link={`/products/${product.id}`}
                likes={product.likes}
                views={product.views}
              />
            ))}
>>>>>>> bc6417a (feature 02 product side bar)
          </div>
        )}
      </main>
    </div>
  );
}