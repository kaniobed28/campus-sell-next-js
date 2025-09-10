import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

// Basket item model
const createBasketItem = (product, quantity = 1) => ({
  id: uuidv4(),
  productId: product.id,
  title: product.title || product.name || 'Untitled Product',
  price: parseFloat(product.price) || 0,
  quantity: quantity,
  image: product.image || product.imageUrl || '/images/placeholder-product.jpg',
  sellerId: product.sellerId || product.userId || null,
  addedAt: new Date().toISOString()
});

// Basket model
const createBasket = (userId = null) => ({
  id: userId || `guest_${uuidv4()}`,
  items: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

// Calculate totals
const calculateBasketTotals = (items) => {
  return items.reduce(
    (totals, item) => {
      totals.totalItems += item.quantity;
      totals.totalPrice += item.price * item.quantity;
      return totals;
    },
    { totalItems: 0, totalPrice: 0 }
  );
};

// Basket store
export const useBasketStore = create(
  persist(
    (set, get) => ({
      // State
      items: [],
      isLoading: false,
      error: null,
      totalItems: 0,
      totalPrice: 0,
      
      // Actions
      addToBasket: (product, quantity = 1) => {
        set((state) => {
          // Check if item already exists in basket
          const existingItemIndex = state.items.findIndex(
            item => item.productId === product.id
          );
          
          let updatedItems;
          if (existingItemIndex >= 0) {
            // Update quantity of existing item
            updatedItems = [...state.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + quantity
            };
          } else {
            // Add new item
            const newItem = createBasketItem(product, quantity);
            updatedItems = [...state.items, newItem];
          }
          
          const totals = calculateBasketTotals(updatedItems);
          
          return {
            items: updatedItems,
            totalItems: totals.totalItems,
            totalPrice: parseFloat(totals.totalPrice.toFixed(2)),
            updatedAt: new Date().toISOString()
          };
        });
      },
      
      removeFromBasket: (itemId) => {
        set((state) => {
          const updatedItems = state.items.filter(item => item.id !== itemId);
          const totals = calculateBasketTotals(updatedItems);
          
          return {
            items: updatedItems,
            totalItems: totals.totalItems,
            totalPrice: parseFloat(totals.totalPrice.toFixed(2)),
            updatedAt: new Date().toISOString()
          };
        });
      },
      
      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeFromBasket(itemId);
          return;
        }
        
        set((state) => {
          const updatedItems = state.items.map(item => 
            item.id === itemId ? { ...item, quantity } : item
          );
          const totals = calculateBasketTotals(updatedItems);
          
          return {
            items: updatedItems,
            totalItems: totals.totalItems,
            totalPrice: parseFloat(totals.totalPrice.toFixed(2)),
            updatedAt: new Date().toISOString()
          };
        });
      },
      
      clearBasket: () => {
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0,
          updatedAt: new Date().toISOString()
        });
      },
      
      // Load basket from storage (localStorage for guests, Firestore for authenticated users)
      loadBasket: async (userId = null) => {
        set({ isLoading: true, error: null });
        
        try {
          if (userId) {
            // Load from Firestore for authenticated users
            const basketRef = doc(db, 'baskets', userId);
            const basketSnap = await getDoc(basketRef);
            
            if (basketSnap.exists()) {
              const basketData = basketSnap.data();
              const totals = calculateBasketTotals(basketData.items || []);
              
              set({
                items: basketData.items || [],
                totalItems: totals.totalItems,
                totalPrice: parseFloat(totals.totalPrice.toFixed(2)),
                updatedAt: basketData.updatedAt || new Date().toISOString()
              });
            } else {
              // Create new basket for user
              const newBasket = createBasket(userId);
              await setDoc(basketRef, newBasket);
              set({
                items: [],
                totalItems: 0,
                totalPrice: 0,
                updatedAt: newBasket.updatedAt
              });
            }
          }
          // For guests, data is automatically loaded by persist middleware
        } catch (error) {
          console.error('Error loading basket:', error);
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },
      
      // Sync basket with Firestore
      syncBasket: async (userId) => {
        if (!userId) return;
        
        try {
          const basketRef = doc(db, 'baskets', userId);
          const basketData = {
            items: get().items,
            totalItems: get().totalItems,
            totalPrice: get().totalPrice,
            updatedAt: new Date().toISOString()
          };
          
          await setDoc(basketRef, basketData, { merge: true });
        } catch (error) {
          console.error('Error syncing basket:', error);
          set({ error: error.message });
        }
      }
    }),
    {
      name: 'basket-storage', // localStorage key
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice,
        updatedAt: state.updatedAt
      })
    }
  )
);