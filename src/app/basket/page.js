"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // For navigation
import ItemCard from "@/components/ItemCard";
import basketData from "@/dummyData/basketData";
import { useAuth } from "../stores/useAuth";
import Loading from "@/components/Loading";
const BasketPage = () => {
  const [basketItems, setBasketItems] = useState(basketData);
  const { user, loading } = useAuth(); // Get user and loading state
  const router = useRouter();

  // If still loading the auth state, show a loading state
  if (loading) return <Loading />;

  // If the user is not authenticated, redirect to login page
  if (!user) {
    router.push("/auth"); // Replace with your actual login route
    return null; // Optionally return null while redirecting
  }

  const handleRemove = (id) => {
    setBasketItems(basketItems.filter((item) => item.id !== id));
  };

  const handleCheckout = () => {
    alert("Proceeding to checkout...");
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Basket</h1>
      {basketItems.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {basketItems.map((item) => (
              <div key={item.id} className="relative">
                <ItemCard
                  id={item.id}
                  image={item.image}
                  title={item.title}
                  price={item.price}
                  likes={item.likes}
                  views={item.views}
                  description={`Price: $${item.price}`}
                  link={`/listings/${item.id}`}
                />
                <button
                  onClick={() => handleRemove(item.id)}
                  className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button
              onClick={handleCheckout}
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 font-bold text-lg"
            >
              Checkout
            </button>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-600">Your basket is empty.</p>
      )}
    </div>
  );
};

export default BasketPage;
