import React from "react";
import ItemCard from "./ItemCard";

const FeaturedListingsSection = () => {
  const featuredItems = [
    { id: 1, title: "Item 1", description: "Description of item 1", image: "https://via.placeholder.com/300x200?text=Item+1" },
    { id: 2, title: "Item 2", description: "Description of item 2", image: "https://via.placeholder.com/300x200?text=Item+2" },
    { id: 3, title: "Item 3", description: "Description of item 3", image: "https://via.placeholder.com/300x200?text=Item+3" },
  ];

  return (
    <section className="py-16 bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Featured Listings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredItems.map((item) => (
            <ItemCard
              key={item.id}
              id={item.id}
              image={item.image}
              title={item.title}
              description={item.description}
              link={`/listings/item-${item.id}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedListingsSection;
