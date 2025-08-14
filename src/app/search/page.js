"use client"; // This marks the file as a Client Component

import { useState, useEffect, Suspense } from "react";
import { db } from "@/lib/firebase";
import ProductGrid from "@/components/ProductGrid";
import { collection, getDocs } from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import { useResponsiveSpacing } from "@/hooks/useViewport";

// Fetch products asynchronously
const fetchProducts = async (query) => {
  const productsQuery = collection(db, "products");
  const snapshot = await getDocs(productsQuery);
  const productsList = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Filter results based on search query
  return query
    ? productsList.filter(
        (product) =>
          (product.title?.toLowerCase() || "").includes(query.toLowerCase()) ||
          (product.category?.toLowerCase() || "").includes(query.toLowerCase())
      )
    : productsList;
};

// The main SearchPage component
function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || ""; // Get query string from URL
  const spacing = useResponsiveSpacing();

  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const filteredResults = await fetchProducts(query);
        setResults(filteredResults);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load search results.");
      }
      setIsLoading(false);
    };

    loadProducts();
  }, [query]);

  return (
    <div className={`container mx-auto ${spacing.container} py-8 md:py-16`}>
      {/* Responsive header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
          Search Results
        </h1>
        {query && (
          <p className="text-base sm:text-lg text-muted-foreground">
            Showing results for "{query}"
          </p>
        )}
        {!isLoading && !error && (
          <p className="text-sm text-muted-foreground mt-1">
            {results.length} {results.length === 1 ? 'result' : 'results'} found
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-center text-muted-foreground">Loading search results...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-center text-destructive font-medium">{error}</p>
        </div>
      ) : results.length > 0 ? (
        <ProductGrid 
          products={results.map((item) => ({
            ...item,
            // Normalize image: use first URL from imageUrls if present, otherwise use image
            image: Array.isArray(item.imageUrls) && item.imageUrls.length > 0
              ? item.imageUrls[0]
              : item.image || "/default-image.jpg",
            title: item.title || "Unknown Product",
            price: typeof item.price === "string"
              ? parseFloat(item.price) || 0
              : item.price || 0,
            description: item.description || item.category || '',
            link: `/listings/${item.id}`,
            likes: item.likes || 0,
            views: item.views || 0
          }))}
          showEmptyState={false}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🔍</span>
          </div>
          <h3 className="text-lg font-medium mb-2">No results found</h3>
          <p className="text-center text-muted-foreground mb-4">
            {query ? `No products found for "${query}"` : "No products available"}
          </p>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Try adjusting your search terms or browse our categories to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
}

// Export with Suspense boundary
export default function Page() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <SearchPage />
    </Suspense>
  );
}



<<<<<<< HEAD

=======
>>>>>>> 9729b63 (bug space added 2 time)
