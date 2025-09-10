import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

class BasketService {
  // Get user basket from Firestore
  async getUserBasket(userId) {
    try {
      const basketRef = doc(db, 'baskets', userId);
      const basketSnap = await getDoc(basketRef);
      
      if (basketSnap.exists()) {
        return { id: basketSnap.id, ...basketSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting user basket:', error);
      throw error;
    }
  }
  
  // Create or update user basket in Firestore
  async saveUserBasket(userId, basketData) {
    try {
      const basketRef = doc(db, 'baskets', userId);
      await setDoc(basketRef, basketData, { merge: true });
      return true;
    } catch (error) {
      console.error('Error saving user basket:', error);
      throw error;
    }
  }
  
  // Add item to user basket
  async addItemToBasket(userId, item) {
    try {
      const basketRef = doc(db, 'baskets', userId);
      const basketSnap = await getDoc(basketRef);
      
      let basketData;
      if (basketSnap.exists()) {
        basketData = basketSnap.data();
        // Check if item already exists
        const existingItemIndex = basketData.items.findIndex(
          basketItem => basketItem.productId === item.productId
        );
        
        if (existingItemIndex >= 0) {
          // Update quantity
          basketData.items[existingItemIndex].quantity += item.quantity;
        } else {
          // Add new item
          basketData.items.push(item);
        }
      } else {
        // Create new basket
        basketData = {
          items: [item],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      
      // Update totals
      const totals = this.calculateBasketTotals(basketData.items);
      basketData.totalItems = totals.totalItems;
      basketData.totalPrice = totals.totalPrice;
      basketData.updatedAt = new Date().toISOString();
      
      await setDoc(basketRef, basketData);
      return basketData;
    } catch (error) {
      console.error('Error adding item to basket:', error);
      throw error;
    }
  }
  
  // Remove item from user basket
  async removeItemFromBasket(userId, itemId) {
    try {
      const basketRef = doc(db, 'baskets', userId);
      const basketSnap = await getDoc(basketRef);
      
      if (!basketSnap.exists()) {
        return null;
      }
      
      const basketData = basketSnap.data();
      basketData.items = basketData.items.filter(item => item.id !== itemId);
      
      // Update totals
      const totals = this.calculateBasketTotals(basketData.items);
      basketData.totalItems = totals.totalItems;
      basketData.totalPrice = totals.totalPrice;
      basketData.updatedAt = new Date().toISOString();
      
      await setDoc(basketRef, basketData);
      return basketData;
    } catch (error) {
      console.error('Error removing item from basket:', error);
      throw error;
    }
  }
  
  // Update item quantity in user basket
  async updateItemQuantity(userId, itemId, quantity) {
    try {
      const basketRef = doc(db, 'baskets', userId);
      const basketSnap = await getDoc(basketRef);
      
      if (!basketSnap.exists()) {
        return null;
      }
      
      const basketData = basketSnap.data();
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        basketData.items = basketData.items.filter(item => item.id !== itemId);
      } else {
        // Update quantity
        const itemIndex = basketData.items.findIndex(item => item.id === itemId);
        if (itemIndex >= 0) {
          basketData.items[itemIndex].quantity = quantity;
        }
      }
      
      // Update totals
      const totals = this.calculateBasketTotals(basketData.items);
      basketData.totalItems = totals.totalItems;
      basketData.totalPrice = totals.totalPrice;
      basketData.updatedAt = new Date().toISOString();
      
      await setDoc(basketRef, basketData);
      return basketData;
    } catch (error) {
      console.error('Error updating item quantity:', error);
      throw error;
    }
  }
  
  // Clear user basket
  async clearUserBasket(userId) {
    try {
      const basketRef = doc(db, 'baskets', userId);
      await deleteDoc(basketRef);
      return true;
    } catch (error) {
      console.error('Error clearing user basket:', error);
      throw error;
    }
  }
  
  // Calculate basket totals
  calculateBasketTotals(items) {
    return items.reduce(
      (totals, item) => {
        totals.totalItems += item.quantity;
        totals.totalPrice += item.price * item.quantity;
        return totals;
      },
      { totalItems: 0, totalPrice: 0 }
    );
  }
  
  // Merge guest basket with user basket on login
  async mergeGuestBasketWithUserBasket(guestBasketItems, userId) {
    try {
      const basketRef = doc(db, 'baskets', userId);
      const basketSnap = await getDoc(basketRef);
      
      let basketData;
      if (basketSnap.exists()) {
        // Merge with existing user basket
        basketData = basketSnap.data();
        
        // Add or merge guest items with user items
        guestBasketItems.forEach(guestItem => {
          const existingItemIndex = basketData.items.findIndex(
            userItem => userItem.productId === guestItem.productId
          );
          
          if (existingItemIndex >= 0) {
            // Merge quantities
            basketData.items[existingItemIndex].quantity += guestItem.quantity;
          } else {
            // Add new item
            basketData.items.push(guestItem);
          }
        });
      } else {
        // Create new basket with guest items
        basketData = {
          items: guestBasketItems,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      
      // Update totals
      const totals = this.calculateBasketTotals(basketData.items);
      basketData.totalItems = totals.totalItems;
      basketData.totalPrice = totals.totalPrice;
      basketData.updatedAt = new Date().toISOString();
      
      await setDoc(basketRef, basketData);
      return basketData;
    } catch (error) {
      console.error('Error merging baskets:', error);
      throw error;
    }
  }
}

export const basketService = new BasketService();