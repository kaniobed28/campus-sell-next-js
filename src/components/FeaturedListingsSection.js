import React from "react";
import ItemCard from "./ItemCard";
import products from "@/dummyData/products"; 

const FeaturedListingsSection = () => {
  // Sort products by likes in descending order and take the top 6
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
          {topLikedProducts.map((item) => (
            <ItemCard
              key={item.id}
              id={item.id}
              image={item.image}
              title={item.name}
              description={item.category}
              price={item.price}
              link={`/listings/${item.id}`}
              likes={item.likes}
              views={item.views}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedListingsSection;
