"use client";

import React from "react";
import Link from "next/link";

// Data for categories
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

const CategoriesPage = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8 text-center">Categories</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map((category, index) => (
          <div key={index} className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">{category.name}</h2>
            <ul className="space-y-2">
              {category.types.map((type, typeIndex) => (
                <li key={typeIndex}>
                  <Link
                    href={`/categories/${category.name.toLowerCase()}/${type
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                    className="text-blue-600 hover:underline"
                  >
                    {type}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
