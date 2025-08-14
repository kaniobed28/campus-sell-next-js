"use client";

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
import { db } from "@/lib/firebase";

/**
 * Service class for basket operations with Firebase
 */
export class BasketService {
  /**
   * Add item to user's basket
   */
  static async addItem(userId, productId, quantity) {
    if (!userId || !productId || !quantity || quantity < 1) {
      throw new Error("Invalid parameters for adding item to basket");
    }

    try {
      const cartItem = {
        userId,
        productId,
        quantity: parseInt(quantity),
        timestamp: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "cart"), cartItem);
      return docRef.id;
    } catch (error) {
      console.error("Error adding item to basket:", error);
      throw error;
    }
  }

  /**
   * Update item quantity in basket
   */
  static async updateItem(itemId, quantity) {
    if (!itemId || quantity < 1) {
      throw new Error("Invalid parameters for updating item");
    }

    try {
      await updateDoc(doc(db, "cart", itemId), {
        quantity: parseInt(quantity),
      });
    } catch (error) {
      console.error("Error updating item:", error);
      throw error;
    }
  }

  /**
   * Remove item from basket
   */
  static async removeItem(itemId) {
    if (!itemId) {
      throw new Error("Item ID is required for removal");
    }

    try {
      await deleteDoc(doc(db, "cart", itemId));
    } catch (error) {
      console.error("Error removing item:", error);
      throw error;
    }
  }

  /**
   * Get user's basket items
   */
  static async getUserBasket(userId) {
    if (!userId) {
      throw new Error("User ID is required to fetch basket");
    }

    try {
      const cartQuery = query(collection(db, "cart"), where("userId", "==", userId));
      const cartSnapshot = await getDocs(cartQuery);
      
      return cartSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error fetching basket:", error);
      throw error;
    }
  }

  /**
   * Clear user's entire basket
   */
  static async clearUserBasket(userId) {
    if (!userId) {
      throw new Error("User ID is required to clear basket");
    }

    try {
      const cartQuery = query(collection(db, "cart"), where("userId", "==", userId));
      const cartSnapshot = await getDocs(cartQuery);
      
      if (cartSnapshot.empty) {
        return;
      }

      const batch = writeBatch(db);
      cartSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error("Error clearing basket:", error);
      throw error;
    }
  }

  /**
   * Get product details for basket items
   */
  static async getProductDetails(productIds) {
    if (!productIds || productIds.length === 0) {
      return {};
    }

    try {
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
      
      return products.filter(Boolean).reduce((map, product) => {
        map[product.id] = product;
        return map;
      }, {});
    } catch (error) {
      console.error("Error fetching product details:", error);
      throw error;
    }
  }

  /**
   * Check if item exists in user's basket
   */
  static async findExistingItem(userId, productId) {
    if (!userId || !productId) {
      return null;
    }

    try {
      const cartQuery = query(
        collection(db, "cart"), 
        where("userId", "==", userId),
        where("productId", "==", productId)
      );
      const cartSnapshot = await getDocs(cartQuery);
      
      if (cartSnapshot.empty) {
        return null;
      }
      
      const doc = cartSnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error("Error finding existing item:", error);
      throw error;
    }
  }
}

export default BasketService;