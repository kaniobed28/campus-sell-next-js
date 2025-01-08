import { create } from "zustand";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Import Firebase Firestore instance

export const useProductStore = create((set) => ({
  // Initial state
  products: [],
  filteredProducts: [], // Store filtered products
  filters: { category: "All", priceRange: [0, 1000] },
  loading: false,

  // Fetch products from Firestore
  fetchProducts: async () => {
    set({ loading: true });
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const products = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      set({ products, filteredProducts: products, loading: false });
    } catch (error) {
      console.error("Error fetching products:", error);
      set({ loading: false });
    }
  },

  // Update filters
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  // Apply filters to the product list
  applyFilters: () => {
    set((state) => {
      const { products, filters } = state;
      let filteredProducts = products;

      // Apply category filter
      if (filters.category && filters.category !== "All") {
        filteredProducts = filteredProducts.filter(
          (product) => product.category === filters.category
        );
      }

      // Apply price range filter
      const [minPrice, maxPrice] = filters.priceRange || [0, Infinity];
      filteredProducts = filteredProducts.filter(
        (product) => product.price >= minPrice && product.price <= maxPrice
      );

      return { filteredProducts };
    });
  },
}));
