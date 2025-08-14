"use client";
import React, { useEffect } from "react";
import { useProductStore } from "../stores/useProductStore";
import ProductsSidebar from "../../components/ProductsSideBar";
import ProductGrid from "../../components/ProductGrid";
import Loading from "@/components/Loading";
import { useResponsiveSpacing } from "@/hooks/useViewport";

export default function ProductsPage() {
  const {
    filteredProducts,
    fetchProducts,
    applyFilters,
    loading,
    error,
    filters, // To monitor changes in filters
  } = useProductStore();
  
  const spacing = useResponsiveSpacing();

  // Fetch products from Firebase when the component mounts
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [applyFilters, filters]); // Depend on filters to reapply filters when they change

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background">
      {/* Sidebar */}
      <ProductsSidebar />

      {/* Product Grid */}
      <main className={`flex-1 ${spacing.container} py-4`}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Campus Marketplace
          </h1>
          <p className="text-muted-foreground">
            {loading ? 'Loading products...' : `${filteredProducts.length} products available`}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Error Loading Products</h3>
            <p className="text-red-700">{error}</p>
            <button 
              onClick={fetchProducts}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <Loading />
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              {filters.search || filters.category !== 'All' 
                ? 'Try adjusting your filters or search terms'
                : 'Be the first to list a product!'
              }
            </p>
            <a 
              href="/sell" 
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              List Your First Product
            </a>
          </div>
        ) : (
          <ProductGrid 
            products={filteredProducts.map((product) => ({
              ...product,
              // Get the best available image
              image: product.imageUrls?.[0] || product.image || "/default-image.jpg",
              // Create a rich description with category info
              description: [
                product.description,
                product.category && `Category: ${product.category}`,
                product.sellerName && `Seller: ${product.sellerName}`
              ].filter(Boolean).join(' • ')
            }))}
            emptyStateMessage={
              filters.search || filters.category !== 'All' 
                ? 'Try adjusting your filters or search terms'
                : 'Be the first to list a product!'
            }
            emptyStateIcon="📦"
          />
        )}

        {/* Debug Info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm">
            <h4 className="font-semibold mb-2">Debug Info:</h4>
            <p>Total products: {filteredProducts.length}</p>
            <p>Active filters: {JSON.stringify(filters)}</p>
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
            {error && <p className="text-red-600">Error: {error}</p>}
          </div>
        )}
      </main>
    </div>
  );
}



