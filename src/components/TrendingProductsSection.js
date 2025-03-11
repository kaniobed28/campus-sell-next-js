import React from "react";
import ItemCard from "./ItemCard";
import products from "@/dummyData/products"; // Import products from dummy data

const TrendingProductsSection = () => {
  // Sort products by likes in descending order and take the top 6
  const trendingProducts = [...products]
    .sort((a, b) => (b.likes || 0) - (a.likes || 0)) // Handle undefined likes
    .slice(0, 6);

  return (
    <section className="py-16 bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Trending Products
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trendingProducts.map((product) => {
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
                title={product.title}
                description={product.subtype || product.category || "No subtype"} // Fallback for subtype
                price={Number(product.price).toFixed(2)} // Ensure price is a formatted number
                link={`/listings/${product.id}`}
                likes={product.likes || 0} // Default to 0 if not provided
                views={product.views || 0} // Default to 0 if not provided
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrendingProductsSection;