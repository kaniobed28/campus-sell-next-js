"use client";

import React, { useEffect } from "react";
import { useProductStore } from "../stores/useProductStore";
import ProductsSidebar from "../../components/ProductsSideBar";

export default function ProductsPage() {
  const {
    products,
    fetchProducts,
    applyFilters,
    loading,
  } = useProductStore();

  // Fetch products from Firebase when the component mounts
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return (
    <div className="flex">
      {/* Sidebar */}
      <ProductsSidebar />

      {/* Product Grid */}
      <main className="flex-1 p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-lg font-semibold text-gray-500">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-lg font-semibold text-gray-500">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-md"
                />
                <h2 className="text-lg font-semibold mt-2">{product.name}</h2>
                <p className="text-gray-600 mt-1">${product.price}</p>
                <div className="mt-4 flex justify-between items-center">
                  <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
                    View Details
                  </button>
                  <p className="text-sm text-gray-500">{product.category}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
