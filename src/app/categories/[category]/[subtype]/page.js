'use client';
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import generateProducts from "@/dummyData/generateProducts";
import Loading from "@/components/Loading";
import ItemCard from "@/components/ItemCard"; // Import the ItemCard component

const CategorySubtypePage = () => {
  const params = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get and decode URL parameters
  const category = decodeURIComponent(params.category);
  const subtype = decodeURIComponent(params.subtype);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const generatedProducts = await generateProducts();
        setProducts(generatedProducts);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter products by category and subtype
  const filteredProducts = products.filter((product) => {
    const productCategory = product.category?.trim().toLowerCase();
    const productSubtype = product.subcategory?.trim().toLowerCase();
    return (
      productCategory === category.toLowerCase() &&
      productSubtype === subtype.toLowerCase()
    );
  });

  if (loading) {
    return <Loading />;
  }

  if (!filteredProducts.length) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">No Products Found</h1>
        <p className="text-gray-600">
          No products available in {category.replace(/-/g, " ")} -{" "}
          {subtype.replace(/-/g, " ")}.
        </p>
        <Link
          href="/categories"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          Back to Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3 capitalize">
          {category.replace(/-/g, " ")}
        </h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-3 capitalize">
          {subtype.replace(/-/g, " ")}
        </h2>
        <p className="text-gray-600">
          Explore our collection of {subtype.replace(/-/g, " ")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ItemCard
            key={product.id}
            id={product.id}
            image={product.image}
            title={product.title}
            description={product.description}
            price={Number(product.price).toFixed(2)}
            link={`/listings/${product.id}`}
            likes={product.likes || 0} // Default to 0 if likes are not provided
            views={product.views || 0} // Default to 0 if views are not provided
          />
        ))}
      </div>
    </div>
  );
};

export default CategorySubtypePage;