"use client";
import React from "react";
import { usePathname } from "next/navigation";
import products from '../../../dummyData/products';
import Link from "next/link";

// const products = generateDummyProducts(50);

const CategoryPage = () => {
  const pathname = usePathname();
  const category = pathname.split("/").pop(); // Extract the category from the URL

  const filteredProducts = products.filter(
    (product) => product.category.toLowerCase() === category
  );

  if (!filteredProducts.length) {
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
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {filteredProducts.map((product, index) => (
          <div key={index} className="bg-white shadow-md rounded-lg p-6">
            <h2 className="font-semibold">{product.name}</h2>
            <p>${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
