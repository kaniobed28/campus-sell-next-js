"use client";
import React, { useEffect } from "react";
import { useProductStore } from "../stores/useProductStore";
import ProductsSidebar from "../../components/ProductsSideBar";
import ItemCard from "../../components/ItemCard";

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
          <div className="flex items-center justify-center h-full">
            <p className="text-lg font-semibold text-gray-500">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-lg font-semibold text-gray-500">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
          </div>
        )}
      </main>
    </div>
  );
}
