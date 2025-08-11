"use client";

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
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
  getDoc,
  writeBatch 
} from "firebase/firestore";
import useProfileStore from "./useProfileStore";
import BasketService from "@/services/basketService";

// Local storage key for guest users
const GUEST_BASKET_KEY = "campus-sell-guest-basket";

// Helper function to get guest basket from localStorage
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

// Helper function to save guest basket to localStorage
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

// Helper function to clear guest basket
const clearGuestBasket = () => {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem(GUEST_BASKET_KEY);
  } catch (error) {
    console.error("Error clearing guest basket:", error);
  }
};

export const useBasketStore = create(
  subscribeWithSelector((set, get) => ({
    // Core basket data
    items: [],
    savedItems: [],
    
    // UI state
    isLoading: false,
    isUpdating: {}, // Track individual item updates
    error: null,
    
    // Computed values (cached)
    totalPrice: 0,
    itemCount: 0,
    
    // Sync state
    lastSyncTime: null,
    hasPendingChanges: false,
    
    // Guest user state
    guestItems: [],
    isGuestMode: false,

    // Initialize basket - called when component mounts
    initializeBasket: async () => {
      const { authUser } = useProfileStore.getState();
      
      if (authUser) {
        // Authenticated user - load from Firebase
        await get().syncWithFirebase();
        
        // Check for guest items to migrate
        const guestBasket = getGuestBasket();
        if (guestBasket.items.length > 0) {
          await get().migrateGuestBasket();
        }
      } else {
        // Guest user - load from localStorage
        const guestBasket = getGuestBasket();
        set({ 
          guestItems: guestBasket.items || [],
          isGuestMode: true 
        });
        get().computeValues();
      }
    },

    // Add item to basket
    addToBasket: async (product, quantity = 1) => {
      const { authUser } = useProfileStore.getState();
      const state = get();
      
      // Validate quantity
      if (!quantity || quantity < 1) {
        const errorMessage = "Quantity must be at least 1";
        set({ error: errorMessage });
        throw new Error(errorMessage);
      }

      set({ isLoading: true, error: null });

      try {
        if (authUser) {
          // Authenticated user - handle Firebase operations
          await get().addToBasketAuthenticated(product, quantity, authUser);
        } else {
          // Guest user - handle localStorage
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
      const state = get();
      
      // Check if item already exists
      const existingItem = state.items.find(item => item.productId === product.id);
      
      if (existingItem) {
        // Update existing item quantity
        const newQuantity = existingItem.quantity + quantity;
        await get().updateQuantity(existingItem.id, newQuantity);
      } else {
        // Add new item
        const cartItem = {
          productId: product.id,
          userId: authUser.uid,
          quantity: parseInt(quantity),
          timestamp: new Date().toISOString(),
        };

        // Optimistic update
        const tempId = `temp-${Date.now()}`;
        const optimisticItem = {
          ...cartItem,
          id: tempId,
          product: product,
          isOptimistic: true
        };

        set(state => ({
          items: [...state.items, optimisticItem],
          isLoading: false
        }));

        try {
          // Persist to Firebase
          const docRef = await addDoc(collection(db, "cart"), cartItem);
          
          // Update with real ID
          set(state => ({
            items: state.items.map(item => 
              item.id === tempId 
                ? { ...item, id: docRef.id, isOptimistic: false }
                : item
            )
          }));
        } catch (error) {
          // Revert optimistic update
          set(state => ({
            items: state.items.filter(item => item.id !== tempId),
            error: error.message
          }));
          throw error;
        }
      }
    },

    // Add to basket for guest users
    addToBasketGuest: (product, quantity) => {
      const state = get();
      const guestBasket = getGuestBasket();
      
      // Check if item already exists
      const existingItemIndex = guestBasket.items.findIndex(item => item.productId === product.id);
      
      if (existingItemIndex >= 0) {
        // Update existing item
        guestBasket.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        guestBasket.items.push({
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
      const state = get();
      
      if (newQuantity < 1) {
        return get().removeFromBasket(itemId);
      }

      // Set updating state for this item
      set(state => ({
        isUpdating: { ...state.isUpdating, [itemId]: true },
        error: null
      }));

      try {
        if (authUser) {
          // Authenticated user
          const item = state.items.find(item => item.id === itemId);
          if (!item) throw new Error("Item not found");

          // Optimistic update
          set(state => ({
            items: state.items.map(item => 
              item.id === itemId ? { ...item, quantity: newQuantity } : item
            )
          }));

          // Persist to Firebase
          await updateDoc(doc(db, "cart", itemId), { 
            quantity: newQuantity,
            updatedAt: new Date().toISOString()
          });
        } else {
          // Guest user
          const guestBasket = getGuestBasket();
          const itemIndex = guestBasket.items.findIndex(item => 
            item.productId === itemId || `guest-${item.productId}` === itemId
          );
          
          if (itemIndex >= 0) {
            guestBasket.items[itemIndex].quantity = newQuantity;
            saveGuestBasket(guestBasket);
            set({ guestItems: guestBasket.items });
          }
        }
        
        get().computeValues();
      } catch (error) {
        console.error("Error updating quantity:", error);
        // Revert optimistic update
        await get().syncWithFirebase();
        set({ error: error.message });
        throw error;
      } finally {
        set(state => ({
          isUpdating: { ...state.isUpdating, [itemId]: false }
        }));
      }
    },

    // Remove item from basket
    removeFromBasket: async (itemId) => {
      const { authUser } = useProfileStore.getState();
      const state = get();

      set(state => ({
        isUpdating: { ...state.isUpdating, [itemId]: true },
        error: null
      }));

      try {
        if (authUser) {
          // Authenticated user
          const item = state.items.find(item => item.id === itemId);
          if (!item) throw new Error("Item not found");

          // Optimistic update
          set(state => ({
            items: state.items.filter(item => item.id !== itemId)
          }));

          // Persist to Firebase
          await deleteDoc(doc(db, "cart", itemId));
        } else {
          // Guest user
          const guestBasket = getGuestBasket();
          guestBasket.items = guestBasket.items.filter(item => 
            item.productId !== itemId && `guest-${item.productId}` !== itemId
          );
          saveGuestBasket(guestBasket);
          set({ guestItems: guestBasket.items });
        }
        
        get().computeValues();
      } catch (error) {
        console.error("Error removing item:", error);
        // Revert optimistic update
        await get().syncWithFirebase();
        set({ error: error.message });
        throw error;
      } finally {
        set(state => ({
          isUpdating: { ...state.isUpdating, [itemId]: false }
        }));
      }
    },

    // Save item for later
    saveForLater: async (itemId) => {
      const { authUser } = useProfileStore.getState();
      const state = get();

      if (!authUser) {
        set({ error: "Must be logged in to save items" });
        return;
      }

      const item = state.items.find(item => item.id === itemId);
      if (!item) {
        set({ error: "Item not found" });
        return;
      }

      set(state => ({
        isUpdating: { ...state.isUpdating, [itemId]: true },
        error: null
      }));

      try {
        // Create saved item
        const savedItem = {
          userId: authUser.uid,
          productId: item.productId,
          savedAt: new Date().toISOString(),
        };

        // Add to saved items collection
        const savedDocRef = await addDoc(collection(db, "savedItems"), savedItem);
        
        // Remove from cart
        await deleteDoc(doc(db, "cart", itemId));

        // Update local state
        set(state => ({
          items: state.items.filter(i => i.id !== itemId),
          savedItems: [...state.savedItems, {
            ...savedItem,
            id: savedDocRef.id,
            product: item.product
          }]
        }));
        
        get().computeValues();
      } catch (error) {
        console.error("Error saving item for later:", error);
        set({ error: error.message });
        throw error;
      } finally {
        set(state => ({
          isUpdating: { ...state.isUpdating, [itemId]: false }
        }));
      }
    },

    // Move saved item back to basket
    moveToBasket: async (savedItemId) => {
      const { authUser } = useProfileStore.getState();
      const state = get();

      if (!authUser) {
        set({ error: "Must be logged in to move items" });
        return;
      }

      const savedItem = state.savedItems.find(item => item.id === savedItemId);
      if (!savedItem) {
        set({ error: "Saved item not found" });
        return;
      }

      set(state => ({
        isUpdating: { ...state.isUpdating, [savedItemId]: true },
        error: null
      }));

      try {
        // Create cart item
        const cartItem = {
          userId: authUser.uid,
          productId: savedItem.productId,
          quantity: 1,
          timestamp: new Date().toISOString(),
        };

        // Add to cart collection
        const cartDocRef = await addDoc(collection(db, "cart"), cartItem);
        
        // Remove from saved items
        await deleteDoc(doc(db, "savedItems", savedItemId));

        // Update local state
        set(state => ({
          savedItems: state.savedItems.filter(i => i.id !== savedItemId),
          items: [...state.items, {
            ...cartItem,
            id: cartDocRef.id,
            product: savedItem.product
          }]
        }));
        
        get().computeValues();
      } catch (error) {
        console.error("Error moving item to basket:", error);
        set({ error: error.message });
        throw error;
      } finally {
        set(state => ({
          isUpdating: { ...state.isUpdating, [savedItemId]: false }
        }));
      }
    },

    // Clear entire basket
    clearBasket: async () => {
      const { authUser } = useProfileStore.getState();
      const state = get();

      set({ isLoading: true, error: null });

      try {
        if (authUser) {
          // Clear Firebase cart
          const cartQuery = query(collection(db, "cart"), where("userId", "==", authUser.uid));
          const cartSnapshot = await getDocs(cartQuery);
          
          const batch = writeBatch(db);
          cartSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
          });
          await batch.commit();
        } else {
          // Clear guest basket
          clearGuestBasket();
          set({ guestItems: [] });
        }

        set({ 
          items: [],
          isLoading: false
        });
        
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

        // Fetch saved items
        const savedQuery = query(collection(db, "savedItems"), where("userId", "==", authUser.uid));
        const savedSnapshot = await getDocs(savedQuery);
        const savedItems = savedSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Get unique product IDs
        const productIds = [
          ...cartItems.map(item => item.productId),
          ...savedItems.map(item => item.productId)
        ];
        const uniqueProductIds = [...new Set(productIds)];

        // Fetch product details
        const productPromises = uniqueProductIds.map(async (productId) => {
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
        const enrichedCartItems = cartItems.map(item => ({
          ...item,
          product: productsMap[item.productId]
        })).filter(item => item.product); // Filter out items with missing products

        const enrichedSavedItems = savedItems.map(item => ({
          ...item,
          product: productsMap[item.productId]
        })).filter(item => item.product);

        set({
          items: enrichedCartItems,
          savedItems: enrichedSavedItems,
          isLoading: false,
          isGuestMode: false,
          lastSyncTime: new Date().toISOString()
        });

        get().computeValues();
      } catch (error) {
        console.error("Error syncing with Firebase:", error);
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },

    // Migrate guest basket to authenticated user
    migrateGuestBasket: async () => {
      const { authUser } = useProfileStore.getState();
      
      if (!authUser) return;

      const guestBasket = getGuestBasket();
      if (guestBasket.items.length === 0) return;

      set({ isLoading: true });

      try {
        const batch = writeBatch(db);
        
        // Add guest items to Firebase
        guestBasket.items.forEach(guestItem => {
          const cartItem = {
            userId: authUser.uid,
            productId: guestItem.productId,
            quantity: guestItem.quantity,
            timestamp: guestItem.timestamp || new Date().toISOString(),
          };
          
          const docRef = doc(collection(db, "cart"));
          batch.set(docRef, cartItem);
        });

        await batch.commit();
        
        // Clear guest basket
        clearGuestBasket();
        
        // Refresh from Firebase
        await get().syncWithFirebase();
      } catch (error) {
        console.error("Error migrating guest basket:", error);
        set({ error: error.message, isLoading: false });
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

      set({ totalPrice, itemCount });
    },

    // Get total price (computed)
    getTotalPrice: () => get().totalPrice,

    // Get item count (computed)
    getItemCount: () => get().itemCount,

    // Get all items (handles guest/auth mode)
    getAllItems: () => {
      const state = get();
      return state.isGuestMode ? state.guestItems : state.items;
    },

    // Check if item is in basket
    isInBasket: (productId) => {
      const items = get().getAllItems();
      return items.some(item => item.productId === productId);
    },

    // Get item by product ID
    getItemByProductId: (productId) => {
      const items = get().getAllItems();
      return items.find(item => item.productId === productId);
    },

    // Remove saved item
    removeSavedItem: async (savedItemId) => {
      const { authUser } = useProfileStore.getState();
      const state = get();

      if (!authUser) {
        set({ error: "Must be logged in to remove saved items" });
        return;
      }

      const savedItem = state.savedItems.find(item => item.id === savedItemId);
      if (!savedItem) {
        set({ error: "Saved item not found" });
        return;
      }

      set(state => ({
        isUpdating: { ...state.isUpdating, [savedItemId]: true },
        error: null
      }));

      try {
        // Remove from Firebase
        await deleteDoc(doc(db, "savedItems", savedItemId));

        // Update local state
        set(state => ({
          savedItems: state.savedItems.filter(item => item.id !== savedItemId)
        }));
      } catch (error) {
        console.error("Error removing saved item:", error);
        set({ error: error.message });
        throw error;
      } finally {
        set(state => ({
          isUpdating: { ...state.isUpdating, [savedItemId]: false }
        }));
      }
    },

    // Batch move saved items to basket
    batchMoveToBasket: async (savedItemIds) => {
      const { authUser } = useProfileStore.getState();
      const state = get();

      if (!authUser) {
        set({ error: "Must be logged in to move items" });
        return;
      }

      if (!savedItemIds || savedItemIds.length === 0) return;

      set({ isLoading: true, error: null });

      try {
        const batch = writeBatch(db);
        const savedItemsToMove = state.savedItems.filter(item => savedItemIds.includes(item.id));
        
        // Create cart items and remove saved items
        savedItemsToMove.forEach(savedItem => {
          // Add to cart
          const cartItemRef = doc(collection(db, "cart"));
          const cartItem = {
            userId: authUser.uid,
            productId: savedItem.productId,
            quantity: 1,
            timestamp: new Date().toISOString(),
          };
          batch.set(cartItemRef, cartItem);
          
          // Remove from saved items
          batch.delete(doc(db, "savedItems", savedItem.id));
        });

        await batch.commit();

        // Update local state
        set(state => ({
          savedItems: state.savedItems.filter(item => !savedItemIds.includes(item.id)),
          items: [...state.items, ...savedItemsToMove.map(savedItem => ({
            id: `temp-${Date.now()}-${savedItem.id}`, // Temporary ID
            userId: authUser.uid,
            productId: savedItem.productId,
            quantity: 1,
            timestamp: new Date().toISOString(),
            product: savedItem.product
          }))]
        }));

        // Refresh from Firebase to get real IDs
        await get().syncWithFirebase();
        
        get().computeValues();
      } catch (error) {
        console.error("Error batch moving items:", error);
        set({ error: error.message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    // Batch remove saved items
    batchRemoveSavedItems: async (savedItemIds) => {
      const { authUser } = useProfileStore.getState();
      const state = get();

      if (!authUser) {
        set({ error: "Must be logged in to remove saved items" });
        return;
      }

      if (!savedItemIds || savedItemIds.length === 0) return;

      set({ isLoading: true, error: null });

      try {
        const batch = writeBatch(db);
        
        savedItemIds.forEach(itemId => {
          batch.delete(doc(db, "savedItems", itemId));
        });

        await batch.commit();

        // Update local state
        set(state => ({
          savedItems: state.savedItems.filter(item => !savedItemIds.includes(item.id))
        }));
      } catch (error) {
        console.error("Error batch removing saved items:", error);
        set({ error: error.message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    // Add item directly to saved items (without being in basket first)
    addToSavedItems: async (product) => {
      const { authUser } = useProfileStore.getState();
      const state = get();

      if (!authUser) {
        set({ error: "Must be logged in to save items" });
        throw new Error("Must be logged in to save items");
      }

      // Check if item is already saved
      const existingSavedItem = state.savedItems.find(item => item.productId === product.id);
      if (existingSavedItem) {
        set({ error: "Item is already saved" });
        return;
      }

      set({ isLoading: true, error: null });

      try {
        const savedItem = {
          userId: authUser.uid,
          productId: product.id,
          savedAt: new Date().toISOString(),
        };

        const docRef = await addDoc(collection(db, "savedItems"), savedItem);

        // Update local state
        set(state => ({
          savedItems: [...state.savedItems, {
            ...savedItem,
            id: docRef.id,
            product: product
          }],
          isLoading: false
        }));

        return docRef.id;
      } catch (error) {
        console.error("Error adding to saved items:", error);
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },

    // Broadcast basket changes to other tabs
    broadcastChange: (changeType, data = {}) => {
      if (typeof window === 'undefined') return;
      
      const { authUser } = useProfileStore.getState();
      
      try {
        if (authUser) {
          const syncData = {
            userId: authUser.uid,
            changeType,
            timestamp: Date.now(),
            data
          };
          localStorage.setItem('campus-sell-basket-sync', JSON.stringify(syncData));
          
          // Remove immediately to trigger storage event
          setTimeout(() => {
            localStorage.removeItem('campus-sell-basket-sync');
          }, 100);
        }
      } catch (error) {
        console.error('Error broadcasting basket change:', error);
      }
    },

    // Handle cross-tab synchronization
    handleCrossTabSync: (syncData) => {
      const { authUser } = useProfileStore.getState();
      
      if (!authUser || syncData.userId !== authUser.uid) return;
      
      // Only sync if the change is newer than our last sync
      const state = get();
      const lastSyncTime = state.lastSyncTime ? new Date(state.lastSyncTime).getTime() : 0;
      
      if (syncData.timestamp > lastSyncTime) {
        console.log('Syncing basket from cross-tab change:', syncData.changeType);
        get().syncWithFirebase();
      }
    },

    // Enhanced sync with conflict resolution
    syncWithConflictResolution: async () => {
      const { authUser } = useProfileStore.getState();
      
      if (!authUser) {
        set({ isGuestMode: true });
        return;
      }

      const state = get();
      set({ isLoading: true, error: null });

      try {
        // Get current server state
        const serverItems = await BasketService.getUserBasket(authUser.uid);
        const serverSavedItems = await BasketService.getSavedItems(authUser.uid);
        
        // Simple conflict resolution: server wins for now
        // In a more sophisticated system, we could merge changes based on timestamps
        
        // Get product details for all items
        const allProductIds = [
          ...serverItems.map(item => item.productId),
          ...serverSavedItems.map(item => item.productId)
        ];
        const uniqueProductIds = [...new Set(allProductIds)];
        const products = await BasketService.getProductDetails(uniqueProductIds);

        // Enrich items with product data
        const enrichedItems = serverItems.map(item => ({
          ...item,
          product: products[item.productId]
        })).filter(item => item.product);

        const enrichedSavedItems = serverSavedItems.map(item => ({
          ...item,
          product: products[item.productId]
        })).filter(item => item.product);

        set({
          items: enrichedItems,
          savedItems: enrichedSavedItems,
          isLoading: false,
          isGuestMode: false,
          lastSyncTime: new Date().toISOString(),
          hasPendingChanges: false
        });

        get().computeValues();
        
        // Broadcast sync completion
        get().broadcastChange('sync_complete');
        
      } catch (error) {
        console.error("Error syncing with conflict resolution:", error);
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },

    // Clear error
    clearError: () => set({ error: null }),
  }))
);

// Subscribe to auth changes to handle basket migration
if (typeof window !== "undefined") {
  useProfileStore.subscribe(
    (state) => state.authUser,
    (authUser, previousAuthUser) => {
      const basketStore = useBasketStore.getState();
      
      if (authUser && !previousAuthUser) {
        // User just logged in
        basketStore.initializeBasket();
      } else if (!authUser && previousAuthUser) {
        // User just logged out - switch to guest mode
        basketStore.set({
          items: [],
          savedItems: [],
          isGuestMode: true,
          guestItems: getGuestBasket().items || []
        });
        basketStore.computeValues();
      }
    }
  );
}