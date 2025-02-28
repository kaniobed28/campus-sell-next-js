"use client";
import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import products from "@/dummyData/products";

const ListingPage = () => {
    const { id } = useParams();

    if (!id) {
        return <div className="text-center text-gray-500">Loading...</div>;
    }

    // Find the main product based on the id from URL parameters
    const product = products.find((item) => item.id.toString() === id);

    if (!product) {
        return <div className="text-center text-red-500">Product not found.</div>;
    }

    // Filter out products with the same subtype, excluding the current product
const relatedProducts = products.filter(
    (item) => item.category === product.category && item.id.toString() !== id
);


    return (
        <div className="container mx-auto px-4 py-16 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-lg shadow-lg">
                {/* Product Image */}
                <div className="flex justify-center">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full max-w-lg object-cover rounded-lg shadow-md"
                    />
                </div>

                {/* Product Details */}
                <div className="flex flex-col justify-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        {product.name}
                    </h1>
                    <p className="text-xl font-semibold text-blue-600 mb-2">
                        ${product.price}
                    </p>
                    <p className="text-gray-700 mb-4">{product.description}</p>

                    <div className="mb-4">
                        <p className="text-gray-600">
                            <strong>Category:</strong> {product.category}
                        </p>
                        <p className="text-gray-600">
                            <strong>Subtype:</strong> {product.subcategory
                            }
                        </p>
                        <p className="text-gray-600">
                            <strong>Likes:</strong> {product.likes}
                        </p>
                        <p className="text-gray-600">
                            <strong>Views:</strong> {product.views}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-6">
                        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition duration-300">
                            Add to Cart
                        </button>
                        <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-green-700 transition duration-300">
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6">More in {product.subtype}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {relatedProducts.map((related) => (
                            <div key={related.id} className="bg-white p-4 rounded-lg shadow-md">
                                <img
                                    src={related.image}
                                    alt={related.name}
                                    className="w-full h-40 object-cover rounded"
                                />
                                <h3 className="mt-2 font-semibold text-gray-800">{related.name}</h3>
                                <p className="text-blue-600 font-bold">${related.price}</p>
                                <Link
                                    href={`/listings/${related.id}`}
                                    className="text-blue-500 text-sm hover:underline"
                                >
                                    View Details
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListingPage;
