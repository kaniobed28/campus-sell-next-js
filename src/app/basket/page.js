"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; 
import ItemCard from "@/components/ItemCard";
import basketData from "@/dummyData/basketData";
import { useAuth } from "../stores/useAuth";
import Loading from "@/components/Loading";

const BasketPage = () => {
  const [basketItems, setBasketItems] = useState(
    basketData.map((item) => ({ ...item, quantity: 1 }))
  );
  const { user, loading } = useAuth(); 
  const router = useRouter();

  if (loading) return <Loading />;
  if (!user) {
    router.push("/auth");
    return null;
  }

  // Fonction pour supprimer un article du panier
  const handleRemove = (id) => {
    setBasketItems(basketItems.filter((item) => item.id !== id));
  };

  // Fonction pour modifier la quantité d'un article
  const handleQuantityChange = (id, newQuantity) => {
    setBasketItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity > 0 ? newQuantity : 1 } : item
      )
    );
  };

  // Calcul du prix total
  const totalPrice = basketItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

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
              <div key={item.id} className="relative p-4 border rounded shadow">
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
                <div className="mt-2 flex items-center justify-between">
                  <label className="mr-2">Quantity:</label>
                  <input
                    type="number"
                    value={item.quantity}
                    min="1"
                    className="w-16 p-1 border rounded text-center"
                    onChange={(e) =>
                      handleQuantityChange(item.id, parseInt(e.target.value, 10))
                    }
                  />
                </div>
                <p className="mt-2 font-bold">Total: ${(item.price * item.quantity).toFixed(2)}</p>
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
            <h2 className="text-2xl font-bold mb-4">Total Price: ${totalPrice.toFixed(2)}</h2>
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

