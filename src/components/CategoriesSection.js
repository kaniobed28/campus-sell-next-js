import React from "react";
import Link from "next/link";

const categories = [
  {
    name: "Electronics",
    types: ["Laptops", "Phones", "Tablets", "Accessories"],
  },
  {
    name: "Fashion",
    types: ["Men's Wear", "Women's Wear", "Shoes", "Accessories"],
  },
  {
    name: "Food",
    types: ["Groceries", "Snacks", "Drinks", "Prepared Meals"],
  },
  {
    name: "Services",
    types: ["Tutoring", "Repairs", "Cleaning", "Events"],
  },
];

const CategoriesSection = () => {
  return (
    <section className="py-16 bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Explore Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link
              href={`/categories/${category.name.toLowerCase()}`}
              key={index}
              className="bg-accent text-background rounded-lg p-6 text-center shadow-lg hover:bg-primary hover:text-white dark:bg-accent-dark dark:text-background-dark dark:hover:bg-secondary-dark dark:hover:text-white transition-all duration-300"
            >
              <p className="font-semibold text-lg">{category.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
