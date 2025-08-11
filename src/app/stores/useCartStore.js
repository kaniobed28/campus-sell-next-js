// lib/store/cartStore.js
"use client";

import { create } from "zustand";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import useProfileStore from "./useProfileStore";

// Simplified cart store to prevent breaking the app
export const useCartStore = create((set, get) => ({
  cart: [],
  isLoading: false,
  error: null,

  // Add item to Firebase and local state with quantity
  addToCart: async (product, quantity) => {
    set({ isLoading: true, error: null });

    const { authUser } = useProfileStore.getState();
    if (!authUser) {
      const errorMessage = "User must be logged in to add items to cart";
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }

    // Validate quantity
    if (!quantity || quantity < 1) {
      const errorMessage = "Quantity must be at least 1";
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }

    try {
      const cartItem = {
        productId: product.id,
        userId: authUser.uid,
        quantity: parseInt(quantity), // Ensure it's an integer
        timestamp: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "cart"), cartItem);

      set((state) => ({
        cart: [...state.cart, { ...cartItem, id: docRef.id }],
        isLoading: false,
      }));

      return docRef.id;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearCart: () => set({ cart: [], error: null }),

  getCartCount: () => get().cart.length,
}));