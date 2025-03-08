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

        const cartQuery = query(collection(db, "cart"), where("userId", "==", user.uid));
        const cartSnapshot = await getDocs(cartQuery);
        const cartItems = cartSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (cartItems.length === 0) {
          setBasketItems([]);
          setIsLoadingItems(false);
          return;
        }

        const productIds = cartItems.map((item) => item.productId);
        const productPromises = productIds.map(async (productId) => {
          const productDocRef = doc(db, "products", productId);
          const productDocSnap = await getDoc(productDocRef);
          return productDocSnap.exists() ? { id: productId, ...productDocSnap.data() } : null;
        });
        const productDocs = await Promise.all(productPromises);
        const productsMap = productDocs.filter((doc) => doc).reduce((map, doc) => {
          map[doc.id] = doc;
          return map;
        }, {});

        const enrichedItems = cartItems
          .map((cartItem) => {
            const product = productsMap[cartItem.productId];
            if (!product) return null;
            const price = typeof product.price === "string" ? parseFloat(product.price) || 0 : product.price || 0;
            return {
              id: cartItem.id,
              productId: cartItem.productId,
              quantity: cartItem.quantity || 1,
              image: product.image || "/default-image.jpg",
              title: product.title || "Unknown Product",
              price,
              likes: product.likes || 0,
              views: product.views || 0,
              description: `Price: $${price.toFixed(2)} | Quantity: ${cartItem.quantity || 1}`,
              link: `/listings/${cartItem.productId}`,
            };
          })
          .filter(Boolean);

        setBasketItems(enrichedItems);
      } catch (err) {
        console.error("Error fetching basket items:", err);
        setError("Failed to load basket items. Please try again.");
      } finally {
        setIsLoadingItems(false);
      }
    };

    if (!authLoading && user) fetchBasketItems();
  }, [user, authLoading]);

  if (authLoading || isLoadingItems) return <Loading />;
  if (!user) {
    router.push("/auth");
    return null;
  }

  const handleRemove = async (id) => {
    try {
      await deleteDoc(doc(db, "cart", id));
      setBasketItems(basketItems.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error removing item:", err);
      setError("Failed to remove item. Please try again.");
    }
  };

  const handleCheckout = () => {
    if (basketItems.length === 0) {
      setError("Your basket is empty. Add items before checking out.");
      return;
    }
    router.push("/basket/checkout"); // Redirect to checkout page
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Basket</h1>
      {error && <p className="text-center text-red-600 mb-4">{error}</p>}
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
              Proceed to Checkout
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