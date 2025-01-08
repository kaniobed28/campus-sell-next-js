import React from "react";
import ItemCard from "./ItemCard";

const TrendingProductsSection = () => {
  const trendingProducts = [
    { id: 1, name: "Laptop", price: "$500", img: "/laptop.jpg" },
    { id: 2, name: "Smartphone", price: "$300", img: "/smartphone.jpg" },
    { id: 3, name: "Headphones", price: "$50", img: "/headphones.jpg" },
  ];

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
              image={product.img}
              title={product.name}
              description={product.price}
              link={`/products/${product.id}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingProductsSection;
