"use client";

import { create } from "zustand";
import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  getDoc 
} from "firebase/firestore";
import useProfileStore from "./useProfileStore";

// Local storage key for guest users
const GUEST_BASKET_KEY = "campus-sell-guest-basket";

// Global flag to prevent multiple initializations across components
let globalInitializationPromise = null;

// Helper functions for localStorage
const getGuestBasket = () => {
  if (typeof window === "undefined") return { items: [], savedItems: [] };
  
  try {
    const stored = localStorage.getItem(GUEST_BASKET_KEY);
    return stored ? JSON.parse(stored) : { items: [], savedItems: [] };
  } catch (error) {
    console.error("Error reading guest basket:", error);
    return { items: [], savedItems: [] };
  }
};

const saveGuestBasket = (basketData) => {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(GUEST_BASKET_KEY, JSON.stringify({
      ...basketData,
      lastUpdated: new Date().toISOString()
    }));
  } catch (error) {
    console.error("Error saving guest basket:", error);
  }
};

export const useBasketStore = create((set, get) => ({
  // Core basket data
  items: [],
  savedItems: [],
  
  // UI state
  isLoading: false,
  error: null,
  
  // Computed values
  totalPrice: 0,
  itemCount: 0,
  
  // Guest user state
  guestItems: [],
  isGuestMode: false,
  
  // Initialization state
  isInitialized: false,
  isInitializing: false,

  // Initialize basket
  initializeBasket: async () => {
    const state = get();
    
    // Prevent multiple simultaneous initializations globally
    if (state.isInitialized || state.isInitializing || globalInitializationPromise) {
      if (globalInitializationPromise) {
        return globalInitializationPromise;
      }
      return;
    }
    
    // Create a global promise to prevent multiple initializations
    globalInitializationPromise = (async () => {
      set({ isInitializing: true });
      
      try {
        const { authUser } = useProfileStore.getState();
        
        if (authUser) {
          // Authenticated user - load from Firebase
          await get().syncWithFirebase();
        } else {
          // Guest user - load from localStorage
          const guestBasket = getGuestBasket();
          set({ 
            guestItems: guestBasket.items || [],
            isGuestMode: true 
          });
          get().computeValues();
        }
        
        set({ isInitialized: true, isInitializing: false });
      } catch (error) {
        console.error("Error initializing basket:", error);
        set({ isInitializing: false, error: error.message });
        throw error;
      } finally {
        globalInitializationPromise = null;
      }
    })();
    
    return globalInitializationPromise;
  },

  // Add item to basket
  addToBasket: async (product, quantity = 1) => {
    const { authUser } = useProfileStore.getState();
    
    if (!quantity || quantity < 1) {
      throw new Error("Quantity must be at least 1");
    }

    set({ isLoading: true, error: null });

    try {
      if (authUser) {
        // Authenticated user
        await get().addToBasketAuthenticated(product, quantity, authUser);
      } else {
        // Guest user
        get().addToBasketGuest(product, quantity);
      }
      
      get().computeValues();
    } catch (error) {
      console.error("Error adding to basket:", error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Add to basket for authenticated users
  addToBasketAuthenticated: async (product, quantity, authUser) => {
    const cartItem = {
      productId: product.id,
      userId: authUser.uid,
      quantity: parseInt(quantity),
      timestamp: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, "cart"), cartItem);

    set(state => ({
      items: [...state.items, { 
        ...cartItem, 
        id: docRef.id,
        product: product 
      }],
      isLoading: false
    }));
  },

  // Add to basket for guest users
  addToBasketGuest: (product, quantity) => {
    const guestBasket = getGuestBasket();
    
    // Check if item already exists
    const existingItemIndex = guestBasket.items.findIndex(item => item.productId === product.id);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      guestBasket.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      guestBasket.items.push({
        id: `guest-${Date.now()}`,
        productId: product.id,
        quantity: parseInt(quantity),
        timestamp: new Date().toISOString(),
        product: product
      });
    }
    
    saveGuestBasket(guestBasket);
    set({ 
      guestItems: guestBasket.items,
      isLoading: false 
    });
  },

  // Update item quantity
  updateQuantity: async (itemId, newQuantity) => {
    const { authUser } = useProfileStore.getState();
    
    if (newQuantity < 1) {
      return get().removeFromBasket(itemId);
    }

    try {
      if (authUser) {
        // Authenticated user
        await updateDoc(doc(db, "cart", itemId), { 
          quantity: newQuantity 
        });

        set(state => ({
          items: state.items.map(item => 
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          )
        }));
      } else {
        // Guest user
        const guestBasket = getGuestBasket();
        const itemIndex = guestBasket.items.findIndex(item => item.id === itemId);
        
        if (itemIndex >= 0) {
          guestBasket.items[itemIndex].quantity = newQuantity;
          saveGuestBasket(guestBasket);
          set({ guestItems: guestBasket.items });
        }
      }
      
      get().computeValues();
    } catch (error) {
      console.error("Error updating quantity:", error);
      set({ error: error.message });
      throw error;
    }
  },

  // Remove item from basket
  removeFromBasket: async (itemId) => {
    const { authUser } = useProfileStore.getState();

    try {
      if (authUser) {
        // Authenticated user
        await deleteDoc(doc(db, "cart", itemId));
        set(state => ({
          items: state.items.filter(item => item.id !== itemId)
        }));
      } else {
        // Guest user
        const guestBasket = getGuestBasket();
        guestBasket.items = guestBasket.items.filter(item => item.id !== itemId);
        saveGuestBasket(guestBasket);
        set({ guestItems: guestBasket.items });
      }
      
      get().computeValues();
    } catch (error) {
      console.error("Error removing item:", error);
      set({ error: error.message });
      throw error;
    }
  },

  // Clear entire basket
  clearBasket: async () => {
    const { authUser } = useProfileStore.getState();

    set({ isLoading: true, error: null });

    try {
      if (authUser) {
        // Clear Firebase cart
        const cartQuery = query(collection(db, "cart"), where("userId", "==", authUser.uid));
        const cartSnapshot = await getDocs(cartQuery);
        
        const deletePromises = cartSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        
        set({ items: [] });
      } else {
        // Clear guest basket
        localStorage.removeItem(GUEST_BASKET_KEY);
        set({ guestItems: [] });
      }

      set({ isLoading: false });
      get().computeValues();
    } catch (error) {
      console.error("Error clearing basket:", error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Sync with Firebase (for authenticated users)
  syncWithFirebase: async () => {
    const { authUser } = useProfileStore.getState();
    
    if (!authUser) {
      set({ isGuestMode: true });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      // Fetch cart items
      const cartQuery = query(collection(db, "cart"), where("userId", "==", authUser.uid));
      const cartSnapshot = await getDocs(cartQuery);
      const cartItems = cartSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Get product details
      const productIds = cartItems.map(item => item.productId);
      const productPromises = productIds.map(async (productId) => {
        try {
          const productDoc = await getDoc(doc(db, "products", productId));
          return productDoc.exists() ? { id: productId, ...productDoc.data() } : null;
        } catch (error) {
          console.error(`Error fetching product ${productId}:`, error);
          return null;
        }
      });

      const products = await Promise.all(productPromises);
      const productsMap = products.filter(Boolean).reduce((map, product) => {
        map[product.id] = product;
        return map;
      }, {});

      // Enrich items with product data
      const enrichedItems = cartItems.map(item => ({
        ...item,
        product: productsMap[item.productId]
      })).filter(item => item.product);

      set({
        items: enrichedItems,
        isLoading: false,
        isGuestMode: false
      });

      get().computeValues();
    } catch (error) {
      console.error("Error syncing with Firebase:", error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Compute derived values
  computeValues: () => {
    const state = get();
    const items = state.isGuestMode ? state.guestItems : state.items;
    
    const totalPrice = items.reduce((total, item) => {
      const price = item.product?.price || 0;
      const numericPrice = typeof price === 'string' ? parseFloat(price) || 0 : price;
      return total + (numericPrice * item.quantity);
    }, 0);

    const itemCount = items.reduce((count, item) => count + item.quantity, 0);

    // Only update if values have actually changed to prevent unnecessary re-renders
    if (state.totalPrice !== totalPrice || state.itemCount !== itemCount) {
      set({ totalPrice, itemCount });
    }
  },

  // Get total price
  getTotalPrice: () => get().totalPrice,

  // Get item count
  getItemCount: () => get().itemCount,

  // Get all items
  getAllItems: () => {
    const state = get();
    return state.isGuestMode ? state.guestItems : state.items;
  },

  // Clear error
  clearError: () => set({ error: null }),
  
  // Reset initialization state (useful for testing or cleanup)
  resetInitialization: () => {
    globalInitializationPromise = null;
    set({ 
      isInitialized: false, 
      isInitializing: false 
    });
  },
}));