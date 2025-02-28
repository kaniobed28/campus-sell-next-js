"use client";
import React from "react";
import Link from "next/link";
import products from '../../dummyData/products';

const CategoriesPage = () => {
  // Filter out any products that are missing category or subtype
  const validProducts = products.filter(
    (product) => product.category && product.subtype
  );

  // Group valid products by category and list unique subtypes
  const groupedCategories = validProducts.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = new Set();
    }
    acc[product.category].add(product.subtype);
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8 text-center">Categories</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Object.entries(groupedCategories)
          .sort(([a], [b]) => a.localeCompare(b)) // Sort categories alphabetically
          .map(([category, subtypes], index) => (
            <div key={index} className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">{category}</h2>
              <ul className="space-y-2">
                {Array.from(subtypes)
                  .sort((a, b) => a.localeCompare(b)) // Sort subtypes alphabetically
                  .map((subtype, subtypeIndex) => (
                    <li key={subtypeIndex}>
                      <Link
                        href={`/categories/${category.toLowerCase()}/${subtype
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                        className="text-blue-600 hover:underline"
                      >
                        {subtype}
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
