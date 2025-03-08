// src/pages/basket.js
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ItemCard from "@/components/ItemCard";
import { useAuth } from "../stores/useAuth";
import Loading from "@/components/Loading";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from "firebase/firestore";

const BasketPage = () => {
  const [basketItems, setBasketItems] = useState([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [error, setError] = useState(null);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchBasketItems = async () => {
      if (!user) return;

      try {
        setIsLoadingItems(true);
        setError(null);

        // Step 1: Fetch cart items for the user
        const cartQuery = query(
          collection(db, "cart"),
          where("userId", "==", user.uid)
        );
        const cartSnapshot = await getDocs(cartQuery);
        const cartItems = cartSnapshot.docs.map((doc) => ({
          id: doc.id, // Firestore doc ID for cart item
          ...doc.data(),
        }));

        console.log("Cart Items:", cartItems); // Debug: Check cart data

        if (cartItems.length === 0) {
          setBasketItems([]);
          setIsLoadingItems(false);
          return;
        }

        // Step 2: Extract productIds (which are document IDs in products)
        const productIds = cartItems.map((item) => item.productId);
        console.log("Product IDs from Cart:", productIds); // Debug: Verify productIds

        // Step 3: Fetch products using document IDs
        const productPromises = productIds.map(async (productId) => {
          const productDocRef = doc(db, "products", productId);
          const productDocSnap = await getDoc(productDocRef);
          return productDocSnap.exists()
            ? { id: productId, ...productDocSnap.data() }
            : null;
        });
        const productDocs = await Promise.all(productPromises);
        const productsMap = productDocs
          .filter((doc) => doc !== null)
          .reduce((map, doc) => {
            map[doc.id] = doc;
            return map;
          }, {});

        console.log("Products Map:", productsMap); // Debug: Check fetched products

        // Step 4: Combine cart items with product details
        const enrichedItems = cartItems.map((cartItem) => {
          const product = productsMap[cartItem.productId];
          if (!product) {
            console.warn(`Product not found for productId: ${cartItem.productId}`);
            return null; // Skip if product not found
          }
          // Convert price to number if it's a string
          const price = typeof product.price === "string"
            ? parseFloat(product.price) || 0
            : (typeof product.price === "number" ? product.price : 0);

          return {
            id: cartItem.id, // Cart item ID for removal
            productId: cartItem.productId,
            quantity: cartItem.quantity || 1, // Default to 1 if quantity missing
            image: product.image || "/default-image.jpg",
            title: product.title || "Unknown Product",
            price: price,
            likes: product.likes || 0,
            views: product.views || 0,
            description: `Price: $${price.toFixed(2)} | Quantity: ${cartItem.quantity || 1}`,
            link: `/listings/${cartItem.productId}`,
          };
        }).filter(Boolean); // Remove null entries

        setBasketItems(enrichedItems);
      } catch (err) {
        console.error("Error fetching basket items:", err);
        setError("Failed to load basket items. Please try again.");
      } finally {
        setIsLoadingItems(false);
      }
    };

    if (!authLoading && user) {
      fetchBasketItems();
    }
  }, [user, authLoading]);

  // Handle loading and authentication states
  if (authLoading || isLoadingItems) return <Loading />;
  if (!user) {
    router.push("/auth");
    return null;
  }

  const handleRemove = async (id) => {
    try {
      // Remove from Firestore
      await deleteDoc(doc(db, "cart", id));
      // Update local state
      setBasketItems(basketItems.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error removing item from Firestore:", err);
      setError("Failed to remove item from basket. Please try again.");
    }
  };

  const handleCheckout = () => {
    alert("Proceeding to checkout...");
    // Implement checkout logic here
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Basket</h1>
      {error && (
        <p className="text-center text-red-600 mb-4">{error}</p>
      )}
      {basketItems.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {basketItems.map((item) => (
              <div key={item.id} className="relative">
                <ItemCard
                  id={item.productId}
                  image={item.image}
                  title={item.title}
                  price={item.price}
                  likes={item.likes}
                  views={item.views}
                  description={item.description}
                  link={item.link}
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