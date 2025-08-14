"use client";
import React from "react";
import { usePathname } from "next/navigation";
import products from '../../../../dummyData/products';
import ItemCard from '../../../../components/ItemCard'; 

const TypePage = () => {
  const pathname = usePathname();
  const parts = pathname.split("/");
  const category = parts[parts.length - 2];
  const type = parts[parts.length - 1].replace(/-/g, " ");

  const filteredProducts = products.filter(
    (product) =>
      product.category.toLowerCase() === category &&
      product.subtype?.toLowerCase() === type.toLowerCase()
  );

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {type.charAt(0).toUpperCase() + type.slice(1)} in{" "}
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ItemCard
              key={product.id}
              id={product.id}
              image={product.image}
              title={product.name}
              description={`Price: $${product.price}`}
              link={`/products/${product.id}`} // Adjust the link as per your routing
            />
          ))
        ) : (
          <p className="text-center col-span-full">No products found</p>
        )}
      </div>
    </div>
  );
};

export default TypePage;

<<<<<<< HEAD

=======
>>>>>>> 9729b63 (bug space added 2 time)
