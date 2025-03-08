import { create } from "zustand";
import products from "@/dummyData/products";

export const useProductStore = create((set) => ({
  // Initial state
  products: [],
  filteredProducts: [],
  filters: { category: "All", priceRange: [0, 1000], search: "" },
  loading: false,

  // Fetch products (now imports from products.js)
  fetchProducts: async () => {
    set({ loading: true });
    try {
      set({ products, filteredProducts: products, loading: false });
    } catch (error) {
      console.error("Error fetching products:", error);
      set({ loading: false });
    }
  },

  // Update filters
  setFilters: (filters) =>
    set((state) => {
      const updatedFilters = { ...state.filters, ...filters };
      return { filters: updatedFilters };
    }),

  // Apply filters to the product list
  applyFilters: () => {
    set((state) => {
      const { products, filters } = state;
      let filteredProducts = products;

      // Apply category filter
      if (filters.category && filters.category !== "All") {
        filteredProducts = filteredProducts.filter(
          (product) =>
            product.category.toLowerCase() === filters.category.toLowerCase()
        );
      }

      // Apply price range filter
      const [minPrice, maxPrice] = filters.priceRange || [0, Infinity];
      filteredProducts = filteredProducts.filter(
        (product) => product.price >= minPrice && product.price <= maxPrice
      );

      // Apply search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProducts = filteredProducts.filter((product) =>
          product.name.toLowerCase().includes(searchLower)
        );
      }

      return { filteredProducts };
    });
  },
}));
