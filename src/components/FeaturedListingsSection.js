import React from "react";
import ItemCard from "./ItemCard";
import products from "@/dummyData/products";

const FeaturedListingsSection = () => {
  // Sort products by views in descending order and take the top 6
  const topLikedProducts = [...products]
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);

  return (
    <section className="py-16 bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Featured Listings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {topLikedProducts.map((item) => {
            // Normalize image: use first URL from imageUrls if present, otherwise use image
            const displayImage =
              Array.isArray(item.imageUrls) && item.imageUrls.length > 0
                ? item.imageUrls[0]
                : item.image || "/default-image.jpg";

            return (
              <ItemCard
                key={item.id}
                id={item.id}
                image={displayImage} // Pass normalized image
                title={item.title}
                description={item.category}
                price={item.price}
                link={`/listings/${item.id}`}
                likes={item.likes || 0} // Default to 0 if not provided
                views={item.views || 0} // Default to 0 if not provided
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedListingsSection;