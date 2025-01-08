import { create } from "zustand";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Import Firebase Firestore instance

export const useProductStore = create((set) => ({
  // Initial state
  products: [],
  filteredProducts: [], // Store filtered products
  filters: { category: "All", priceRange: [0, 1000], search: "" }, // Added search field in filters
  loading: false,

  // Fetch products from Firestore or dummy data
  fetchProducts: async () => {
    set({ loading: true });
    try {
      // Dummy data for products
      const products =[
        {
          id: "1",
          name: "Smartphone X",
          category: "Electronics",
          price: 699,
          image: "/images/smartphone.jpg",
        },
        {
          id: "2",
          name: "Running Shoes",
          category: "Sports",
          price: 120,
          image: "/images/shoes.jpg",
        },
        {
          id: "3",
          name: "Leather Jacket",
          category: "Fashion",
          price: 250,
          image: "/images/jacket.jpg",
        },
        {
          id: "4",
          name: "Cookware Set",
          category: "Home",
          price: 89,
          image: "/images/cookware.jpg",
        },
        {
          id: "5",
          name: "Mystery Novel",
          category: "Books",
          price: 15,
          image: "/images/book.jpg",
        },
        {
          id: "6",
          name: "Wireless Headphones",
          category: "Electronics",
          price: 150,
          image: "/images/headphones.jpg",
        },
        {
          id: "7",
          name: "Mountain Bike",
          category: "Sports",
          price: 1200,
          image: "/images/bike.jpg",
        },
        {
          id: "8",
          name: "Formal Suit",
          category: "Fashion",
          price: 350,
          image: "/images/suit.jpg",
        },
        {
          id: "9",
          name: "Vacuum Cleaner",
          category: "Home",
          price: 299,
          image: "/images/vacuum.jpg",
        },
        {
          id: "10",
          name: "Science Fiction Book",
          category: "Books",
          price: 20,
          image: "/images/scifi_book.jpg",
        },
        {
          id: "11",
          name: "4K Smart TV",
          category: "Electronics",
          price: 999,
          image: "/images/tv.jpg",
        },
        {
          id: "12",
          name: "Yoga Mat",
          category: "Sports",
          price: 30,
          image: "/images/yoga_mat.jpg",
        },
        {
          id: "13",
          name: "Winter Coat",
          category: "Fashion",
          price: 500,
          image: "/images/coat.jpg",
        },
        {
          id: "14",
          name: "Sofa Set",
          category: "Home",
          price: 1500,
          image: "/images/sofa.jpg",
        },
        {
          id: "15",
          name: "Cooking Recipe Book",
          category: "Books",
          price: 25,
          image: "/images/recipe_book.jpg",
        },
        {
          id: "16",
          name: "Gaming Console",
          category: "Electronics",
          price: 400,
          image: "/images/console.jpg",
        },
        {
          id: "17",
          name: "Football",
          category: "Sports",
          price: 40,
          image: "/images/football.jpg",
        },
        {
          id: "18",
          name: "Designer Handbag",
          category: "Fashion",
          price: 800,
          image: "/images/handbag.jpg",
        },
        {
          id: "19",
          name: "Microwave Oven",
          category: "Home",
          price: 200,
          image: "/images/microwave.jpg",
        },
        {
          id: "20",
          name: "Historical Novel",
          category: "Books",
          price: 18,
          image: "/images/history_book.jpg",
        },
      ];
      ;
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
          (product) => product.category.toLowerCase() === filters.category.toLowerCase()
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
