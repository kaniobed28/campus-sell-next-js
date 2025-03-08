"use client"; // Needed for Firebase in Next.js App Router

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import ItemCard from "@/components/ItemCard";
import { collection, getDocs } from "firebase/firestore";
import { useSearchParams } from "next/navigation";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || ""; // Get query string from URL

  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const productsQuery = collection(db, "products");
        const snapshot = await getDocs(productsQuery);
        const productsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter results based on search query
        const filtered = query
          ? productsList.filter(
              (product) =>
                (product.title?.toLowerCase() || "").includes(query.toLowerCase()) ||
                (product.category?.toLowerCase() || "").includes(query.toLowerCase())
            )
          : productsList;

        setResults(filtered);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load search results.");
      }

      setIsLoading(false);
    };

    fetchProducts();
  }, [query]);

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">
        Search Results for &quot;{query || "All Products"}&quot;
      </h1>

      {isLoading ? (
        <p className="text-center">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {results.map((item) => (
            <ItemCard
              key={item.id}
              id={item.id}
              image={item.image || "/default-image.jpg"}
              title={item.title || "Unknown Product"}
              price={typeof item.price === "string" ? parseFloat(item.price) || 0 : item.price || 0}
              likes={item.likes || 0}
              views={item.views || 0}
              description={`Price: $${(typeof item.price === "string" ? parseFloat(item.price) || 0 : item.price || 0).toFixed(2)}`}
              link={`/listings/${item.id}`}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">No results found for &quot;{query}&quot;.</p>
      )}
    </div>
  );
}
