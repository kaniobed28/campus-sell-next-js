"use client";
import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import products from "@/dummyData/products";
import { StarIcon, HeartIcon, ShoppingBagIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

const ListingPage = () => {
    const { id } = useParams();

    if (!id) {
        return (
            <div className="text-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
        );
    }

    const product = products.find((item) => item.id.toString() === id);

    if (!product) {
        return (
            <div className="text-center py-24 text-red-600">
                <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
                <Link href="/" className="text-blue-600 hover:underline">
                    Return to Home
                </Link>
            </div>
        );
    }

    const relatedProducts = products.filter(
        (item) => item.category === product.category && item.id.toString() !== id
    );

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            {/* Main Product Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                {/* Product Image */}
                <div className="relative group overflow-hidden rounded-xl">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-xl transform transition-transform duration-300 group-hover:scale-105"
                    />
                    <button className="absolute top-4 right-4 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition">
                        <HeartIcon className="w-6 h-6 text-red-500" />
                    </button>
                </div>

                {/* Product Details */}
                <div className="flex flex-col justify-center">
                    <div className="mb-6">
                        <nav className="flex mb-4" aria-label="Breadcrumb">
                            <ol className="flex items-center space-x-2 text-sm text-gray-500">
                                <li><Link href="/" className="hover:text-blue-600">Home</Link></li>
                                <li>/</li>
                                <li><Link href={`/category/${product.category}`} className="hover:text-blue-600">{product.category}</Link></li>
                                <li>/</li>
                                <li className="font-medium text-gray-900">{product.name}</li>
                            </ol>
                        </nav>

                        <h1 className="text-4xl font-bold text-gray-900 mb-3">{product.name}</h1>
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <StarIcon key={i} className={`w-5 h-5 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`} />
                                ))}
                            </div>
                            <span className="text-gray-500">(142 reviews)</span>
                        </div>
                        
                        <p className="text-3xl font-bold text-blue-600 mb-6">
                            ${product.price}
                            <span className="text-sm text-gray-500 ml-2">incl. VAT</span>
                        </p>

                        <p className="text-gray-700 text-lg leading-relaxed mb-6">{product.description}</p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <span className="block text-sm text-gray-500 mb-1">Category</span>
                                <span className="font-medium">{product.category}</span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <span className="block text-sm text-gray-500 mb-1">Subtype</span>
                                <span className="font-medium">{product.subcategory}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-4">
                        <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center space-x-3 hover:bg-blue-700 transition-transform transform hover:scale-[1.02]">
                            <ShoppingBagIcon className="w-6 h-6" />
                            <span>Add to Cart</span>
                        </button>
                        <button className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center space-x-3 hover:bg-emerald-700 transition-transform transform hover:scale-[1.02]">
                            <ArrowRightIcon className="w-6 h-6" />
                            <span>Buy Now</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <div className="mt-16">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
                        <Link href={`/category/${product.category}`} className="text-blue-600 hover:underline flex items-center">
                            View All <ArrowRightIcon className="w-4 h-4 ml-2" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {relatedProducts.map((related) => (
                            <div key={related.id} className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                                <div className="relative group overflow-hidden rounded-lg mb-4">
                                    <img
                                        src={related.image}
                                        alt={related.name}
                                        className="w-full h-48 object-cover rounded-lg transform transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <button className="absolute top-4 right-4 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition">
                                        <HeartIcon className="w-6 h-6 text-red-500" />
                                    </button>
                                </div>
                                <h3 className="font-semibold text-gray-900 text-lg mb-1">{related.name}</h3>
                                <p className="text-blue-600 font-bold text-xl mb-3">${related.price}</p>
                                <Link
                                    href={`/listings/${related.id}`}
                                    className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors"
                                >
                                    View Details
                                    <ArrowRightIcon className="w-4 h-4 ml-2" />
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