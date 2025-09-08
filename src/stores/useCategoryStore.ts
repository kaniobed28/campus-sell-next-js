import { create } from 'zustand';
import { CategoryService } from '@/services/CategoryService';
import { Category, CategoryTreeNode, CategoryFilter } from '@/types/category';

interface CategoryState {
  // State
  categories: Category[];
  categoryTree: CategoryTreeNode[];
  selectedCategory: Category | null;
  subcategories: Category[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  searchResults: Category[];
  filters: CategoryFilter;
  
  // Computed state
  parentCategories: Category[];
  categoriesForSelection: Array<{id: string, name: string, level: number, disabled?: boolean}>;
  
  // Actions
  fetchCategories: () => Promise<void>;
  fetchCategoryTree: () => Promise<void>;
  selectCategory: (categoryId: string) => Promise<void>;
  selectCategoryBySlug: (slug: string) => Promise<void>;
  fetchSubcategories: (parentId: string) => Promise<void>;
  searchCategories: (searchTerm: string) => Promise<void>;
  clearSearch: () => void;
  setFilters: (filters: Partial<CategoryFilter>) => void;
  clearFilters: () => void;
  
  // Admin actions
  createCategory: (categoryData: {
    name: string;
    description?: string;
    icon?: string;
    parentId?: string;
    displayOrder?: number;
    createdBy: string;
  }) => Promise<Category>;
  updateCategory: (id: string, updates: {
    name?: string;
    description?: string;
    icon?: string;
    displayOrder?: number;
    isActive?: boolean;
  }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  reorderCategories: (categoryOrders: Array<{id: string, displayOrder: number}>) => Promise<void>;
  
  // Utility actions
  getCategoryBreadcrumbs: (categoryId: string) => Promise<Array<{id: string, name: string, slug: string}>>;
  updateProductCount: (categoryId: string, count: number) => Promise<void>;
  refreshCategories: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const initialFilters: CategoryFilter = {
  priceRange: undefined,
  condition: undefined,
  location: undefined,
  datePosted: 'all',
  sortBy: 'newest',
};

const useCategoryStore = create<CategoryState>((set, get) => {
  const categoryService = new CategoryService();

  return {
    // Initial state
    categories: [],
    categoryTree: [],
    selectedCategory: null,
    subcategories: [],
    loading: false,
    error: null,
    searchTerm: '',
    searchResults: [],
    filters: initialFilters,
    parentCategories: [],
    categoriesForSelection: [],

    // Actions
    fetchCategories: async () => {
      set({ loading: true, error: null });
      try {
        const categories = await categoryService.getActiveCategories();
        const parentCategories = categories.filter(cat => !cat.parentId);
        const categoriesForSelection = await categoryService.getCategoriesForSelection();
        
        set({ 
          categories, 
          parentCategories,
          categoriesForSelection,
          loading: false 
        });
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Don't set error state if it's just empty/missing categories during auto setup
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch categories';
        if (!errorMessage.includes('No categories found') && !errorMessage.includes('empty')) {
          set({ error: errorMessage });
        }
        set({ loading: false });
      }
    },

    fetchCategoryTree: async () => {
      set({ loading: true, error: null });
      try {
        const categoryTree = await categoryService.getCategoryTree();
        set({ categoryTree, loading: false });
      } catch (error) {
        console.error('Error fetching category tree:', error);
        // Don't set error state if it's just empty/missing categories during auto setup
        // This allows the system to work gracefully while auto setup is running
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch category tree';
        if (!errorMessage.includes('No categories found') && !errorMessage.includes('empty')) {
          set({ error: errorMessage });
        }
        set({ loading: false });
      }
    },

    selectCategory: async (categoryId: string) => {
      set({ loading: true, error: null });
      try {
        const category = await categoryService.getCategoryById(categoryId);
        if (category) {
          const subcategories = await categoryService.getSubcategories(categoryId);
          set({ 
            selectedCategory: category, 
            subcategories,
            loading: false 
          });
        } else {
          set({ 
            error: 'Category not found',
            loading: false 
          });
        }
      } catch (error) {
        console.error('Error selecting category:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Failed to select category',
          loading: false 
        });
      }
    },

    selectCategoryBySlug: async (slug: string) => {
      set({ loading: true, error: null });
      try {
        const category = await categoryService.getCategoryBySlug(slug);
        if (category) {
          const subcategories = await categoryService.getSubcategories(category.id);
          set({ 
            selectedCategory: category, 
            subcategories,
            loading: false 
          });
        } else {
          set({ 
            error: 'Category not found',
            loading: false 
          });
        }
      } catch (error) {
        console.error('Error selecting category by slug:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Failed to select category',
          loading: false 
        });
      }
    },

    fetchSubcategories: async (parentId: string) => {
      set({ loading: true, error: null });
      try {
        const subcategories = await categoryService.getSubcategories(parentId);
        set({ subcategories, loading: false });
      } catch (error) {
        console.error('Error fetching subcategories:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Failed to fetch subcategories',
          loading: false 
        });
      }
    },

    searchCategories: async (searchTerm: string) => {
      set({ loading: true, error: null, searchTerm });
      try {
        const searchResults = await categoryService.searchCategories(searchTerm);
        set({ searchResults, loading: false });
      } catch (error) {
        console.error('Error searching categories:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Failed to search categories',
          loading: false 
        });
      }
    },

    clearSearch: () => {
      set({ searchTerm: '', searchResults: [] });
    },

    setFilters: (newFilters: Partial<CategoryFilter>) => {
      const currentFilters = get().filters;
      set({ filters: { ...currentFilters, ...newFilters } });
    },

    clearFilters: () => {
      set({ filters: initialFilters });
    },

    // Admin actions
    createCategory: async (categoryData) => {
      set({ loading: true, error: null });
      try {
        const newCategory = await categoryService.createCategory(categoryData);
        
        // Refresh categories after creation
        await get().fetchCategories();
        await get().fetchCategoryTree();
        
        set({ loading: false });
        return newCategory;
      } catch (error) {
        console.error('Error creating category:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Failed to create category',
          loading: false 
        });
        throw error;
      }
    },

    updateCategory: async (id: string, updates) => {
      set({ loading: true, error: null });
      try {
        await categoryService.updateCategory(id, updates);
        
        // Refresh categories after update
        await get().fetchCategories();
        await get().fetchCategoryTree();
        
        // Update selected category if it was the one being updated
        const { selectedCategory } = get();
        if (selectedCategory && selectedCategory.id === id) {
          const updatedCategory = await categoryService.getCategoryById(id);
          set({ selectedCategory: updatedCategory });
        }
        
        set({ loading: false });
      } catch (error) {
        console.error('Error updating category:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Failed to update category',
          loading: false 
        });
        throw error;
      }
    },

    deleteCategory: async (id: string) => {
      set({ loading: true, error: null });
      try {
        await categoryService.deleteCategory(id);
        
        // Refresh categories after deletion
        await get().fetchCategories();
        await get().fetchCategoryTree();
        
        // Clear selected category if it was the one being deleted
        const { selectedCategory } = get();
        if (selectedCategory && selectedCategory.id === id) {
          set({ selectedCategory: null, subcategories: [] });
        }
        
        set({ loading: false });
      } catch (error) {
        console.error('Error deleting category:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Failed to delete category',
          loading: false 
        });
        throw error;
      }
    },

    reorderCategories: async (categoryOrders) => {
      set({ loading: true, error: null });
      try {
        await categoryService.reorderCategories(categoryOrders);
        
        // Refresh categories after reordering
        await get().fetchCategories();
        await get().fetchCategoryTree();
        
        set({ loading: false });
      } catch (error) {
        console.error('Error reordering categories:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Failed to reorder categories',
          loading: false 
        });
        throw error;
      }
    },

    // Utility actions
    getCategoryBreadcrumbs: async (categoryId: string) => {
      try {
        return await categoryService.getCategoryBreadcrumbs(categoryId);
      } catch (error) {
        console.error('Error getting category breadcrumbs:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Failed to get category breadcrumbs'
        });
        return [];
      }
    },

    updateProductCount: async (categoryId: string, count: number) => {
      try {
        await categoryService.updateCategoryProductCount(categoryId, count);
        
        // Update the category in local state
        const { categories } = get();
        const updatedCategories = categories.map(cat => 
          cat.id === categoryId 
            ? { ...cat, metadata: { ...cat.metadata, productCount: count } }
            : cat
        );
        
        set({ categories: updatedCategories });
      } catch (error) {
        console.error('Error updating product count:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Failed to update product count'
        });
      }
    },

    refreshCategories: async () => {
      await Promise.all([
        get().fetchCategories(),
        get().fetchCategoryTree()
      ]);
    },

    clearError: () => {
      set({ error: null });
    },

    reset: () => {
      set({
        categories: [],
        categoryTree: [],
        selectedCategory: null,
        subcategories: [],
        loading: false,
        error: null,
        searchTerm: '',
        searchResults: [],
        filters: initialFilters,
        parentCategories: [],
        categoriesForSelection: [],
      });
    },
  };
});

export default useCategoryStore;