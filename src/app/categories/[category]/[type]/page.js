"use client"; // Enables client-side hooks like `usePathname`

import React from "react";
import { usePathname } from "next/navigation";

const TypePage = () => {
  const pathname = usePathname(); // Get the current path
  const parts = pathname.split("/"); // Split the path to extract parameters
  const category = parts[parts.length - 2]; // Get the category from the URL
  const type = parts[parts.length - 1]; // Get the type from the URL

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {type?.replace(/-/g, " ").charAt(0).toUpperCase() + type?.slice(1).replace(/-/g, " ")} in{" "}
        {category?.charAt(0).toUpperCase() + category?.slice(1)}
      </h1>
      {/* Placeholder for items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="bg-white shadow-md rounded-lg p-6 text-center">
            <p className="font-semibold">Item {item}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TypePage;
