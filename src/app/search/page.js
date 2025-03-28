"use client"; // This marks the file as a Client Component

import { useState, useEffect, Suspense } from "react";
import { db } from "@/lib/firebase";
import ItemCard from "@/components/ItemCard";
import { collection, getDocs } from "firebase/firestore";
import { useSearchParams } from "next/navigation";

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
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">
        Search Results for "{query || "All Products"}"
      </h1>

      {isLoading ? (
        <p className="text-center">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {results.map((item) => {
            // Normalize image: use first URL from imageUrls if present, otherwise use image
            const displayImage =
              Array.isArray(item.imageUrls) && item.imageUrls.length > 0
                ? item.imageUrls[0]
                : item.image || "/default-image.jpg";

            const price =
              typeof item.price === "string"
                ? parseFloat(item.price) || 0
                : item.price || 0;

            return (
              <ItemCard
                key={item.id}
                id={item.id}
                image={displayImage} // Pass normalized image
                title={item.title || "Unknown Product"}
                price={price}
                likes={item.likes || 0}
                views={item.views || 0}
                description={`Price: $${price.toFixed(2)}`}
                link={`/listings/${item.id}`}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-600">No results found for "{query}".</p>
      )}
    </div>
  );
}

// Export with Suspense boundary
export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <SearchPage />
    </Suspense>
  );
}