import React from "react";
import ItemCard from "./ItemCard";
import products from "@/dummyData/products"; // Import products from dummy data

const TrendingProductsSection = () => {
  // Sort products by likes in descending order and take the top 6
  const trendingProducts = [...products]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 6);

  return (
    <section className="py-16 bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Trending Products
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trendingProducts.map((product) => (
            <ItemCard
              key={product.id}
              id={product.id}
              image={product.image}
              title={product.name}
              description={`${product.subtype}`} 
              price={`${product.price}`} 
              link={`/products/${product.id}`}
              likes={product.likes}
              views={product.views}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingProductsSection;
