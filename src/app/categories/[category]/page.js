"use client"; 
import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

// Data for categories
const categories = [
  {
    name: "electronics",
    types: ["Laptops", "Phones", "Tablets", "Accessories"],
  },
  {
    name: "fashion",
    types: ["Men's Wear", "Women's Wear", "Shoes", "Accessories"],
  },
  {
    name: "food",
    types: ["Groceries", "Snacks", "Drinks", "Prepared Meals"],
  },
  {
    name: "services",
    types: ["Tutoring", "Repairs", "Cleaning", "Events"],
  },
];

const CategoryPage = () => {
  const pathname = usePathname(); // Get the current path
  const category = pathname.split("/").pop(); // Extract the category from the path

  // Find the selected category
  const selectedCategory = categories.find(
    (cat) => cat.name === category?.toLowerCase()
  );

  // If category not found
  if (!selectedCategory) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Category Not Found</h1>
        <Link href="/categories" className="text-blue-600 hover:underline">
          Back to Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {selectedCategory.name.charAt(0).toUpperCase() + selectedCategory.name.slice(1)}
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {selectedCategory.types.map((type, index) => (
          <Link
            href={`/categories/${category}/${type.toLowerCase().replace(/\s+/g, "-")}`}
            key={index}
            className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg"
          >
            <p className="font-semibold">{type}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
