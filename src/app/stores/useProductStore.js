import { create } from "zustand";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export const useProductStore = create((set, get) => ({
  // Initial state
  products: [],
  filteredProducts: [],
  filters: { category: "All", priceRange: [0, 1000], search: "" },
  loading: false,
  error: null,

  // Fetch products from Firebase
  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const productsRef = collection(db, "products");
      const q = query(productsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      const products = [];
      querySnapshot.forEach((doc) => {
        const productData = doc.data();
        products.push({
          id: doc.id,
          ...productData,
          // Ensure consistent data structure
          name: productData.title || productData.name || 'Untitled Product',
          title: productData.title || productData.name || 'Untitled Product',
          description: productData.description || '',
          category: productData.categoryNames?.[0] || 'Uncategorized',
          categoryNames: productData.categoryNames || [],
          price: productData.price || 0,
          imageUrls: productData.imageUrls || [],
          image: productData.imageUrls?.[0] || productData.image || '/default-image.jpg',
          likes: productData.likes || 0,
          views: productData.views || 0,
          createdAt: productData.createdAt,
          sellerName: productData.sellerName || 'Anonymous',
          status: productData.status || 'active'
        });
      });
      
      console.log(`Fetched ${products.length} products from Firebase`);
      set({ products, filteredProducts: products, loading: false });
      
    } catch (error) {
      console.error("Error fetching products:", error);
      set({ 
        loading: false, 
        error: error.message,
        products: [],
        filteredProducts: []
      });
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
      let filteredProducts = [...products]; // Create a copy to avoid mutating state

      // Filter out inactive products
      filteredProducts = filteredProducts.filter(
        (product) => product.status === 'active' && !product.sold
      );

      // Apply category filter
      if (filters.category && filters.category !== "All") {
        filteredProducts = filteredProducts.filter((product) => {
          // Check both category and categoryNames array
          const categoryMatch = product.category?.toLowerCase() === filters.category.toLowerCase();
          const categoryNamesMatch = product.categoryNames?.some(
            name => name.toLowerCase() === filters.category.toLowerCase()
          );
          return categoryMatch || categoryNamesMatch;
        });
      }

      // Apply price range filter
      const [minPrice, maxPrice] = filters.priceRange || [0, Infinity];
      filteredProducts = filteredProducts.filter(
        (product) => {
          const price = parseFloat(product.price) || 0;
          return price >= minPrice && price <= maxPrice;
        }
      );

      // Apply search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProducts = filteredProducts.filter((product) => {
          const titleMatch = product.title?.toLowerCase().includes(searchLower);
          const nameMatch = product.name?.toLowerCase().includes(searchLower);
          const descriptionMatch = product.description?.toLowerCase().includes(searchLower);
          const categoryMatch = product.category?.toLowerCase().includes(searchLower);
          
          return titleMatch || nameMatch || descriptionMatch || categoryMatch;
        });
      }

      return { filteredProducts };
    });
  },

  // Get unique categories from products
  getCategories: () => {
    const { products } = get();
    const categories = new Set(['All']);
    
    products.forEach(product => {
      if (product.category) {
        categories.add(product.category);
      }
      if (product.categoryNames) {
        product.categoryNames.forEach(name => categories.add(name));
      }
    });
    
    return Array.from(categories);
  },
}));