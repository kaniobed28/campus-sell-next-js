import { renderHook, act } from '@testing-library/react';
import useCategoryStore from '@/stores/useCategoryStore';
import { CategoryService } from '@/services/CategoryService';
import { Category } from '@/types/category';

// Mock the CategoryService
jest.mock('@/services/CategoryService');

const mockCategoryService = CategoryService as jest.MockedClass<typeof CategoryService>;

describe('useCategoryStore', () => {
  let mockService: jest.Mocked<CategoryService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = new mockCategoryService() as jest.Mocked<CategoryService>;
    
    // Mock the service methods
    mockService.getActiveCategories = jest.fn();
    mockService.getCategoryTree = jest.fn();
    mockService.getCategoryById = jest.fn();
    mockService.getCategoryBySlug = jest.fn();
    mockService.getSubcategories = jest.fn();
    mockService.searchCategories = jest.fn();
    mockService.createCategory = jest.fn();
    mockService.updateCategory = jest.fn();
    mockService.deleteCategory = jest.fn();
    mockService.getCategoriesForSelection = jest.fn();
    
    // Reset store state
    useCategoryStore.getState().reset();
  });

  const mockCategory: Category = {
    id: '1',
    name: 'Electronics',
    slug: 'electronics',
    displayOrder: 1,
    isActive: true,
    metadata: {
      productCount: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user1',
    },
  };

  describe('fetchCategories', () => {
    it('should fetch categories successfully', async () => {
      const mockCategories = [mockCategory];
      const mockCategoriesForSelection = [{ id: '1', name: 'Electronics', level: 0 }];
      
      mockService.getActiveCategories.mockResolvedValue(mockCategories);
      mockService.getCategoriesForSelection.mockResolvedValue(mockCategoriesForSelection);

      const { result } = renderHook(() => useCategoryStore());

      await act(async () => {
        await result.current.fetchCategories();
      });

      expect(result.current.categories).toEqual(mockCategories);
      expect(result.current.categoriesForSelection).toEqual(mockCategoriesForSelection);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle fetch categories error', async () => {
      const errorMessage = 'Failed to fetch categories';
      mockService.getActiveCategories.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useCategoryStore());

      await act(async () => {
        await result.current.fetchCategories();
      });

      expect(result.current.categories).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('selectCategory', () => {
    it('should select category successfully', async () => {
      const mockSubcategories = [
        { ...mockCategory, id: '2', name: 'Phones', parentId: '1' }
      ];
      
      mockService.getCategoryById.mockResolvedValue(mockCategory);
      mockService.getSubcategories.mockResolvedValue(mockSubcategories);

      const { result } = renderHook(() => useCategoryStore());

      await act(async () => {
        await result.current.selectCategory('1');
      });

      expect(result.current.selectedCategory).toEqual(mockCategory);
      expect(result.current.subcategories).toEqual(mockSubcategories);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle category not found', async () => {
      mockService.getCategoryById.mockResolvedValue(null);

      const { result } = renderHook(() => useCategoryStore());

      await act(async () => {
        await result.current.selectCategory('nonexistent');
      });

      expect(result.current.selectedCategory).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Category not found');
    });
  });

  describe('selectCategoryBySlug', () => {
    it('should select category by slug successfully', async () => {
      const mockSubcategories = [
        { ...mockCategory, id: '2', name: 'Phones', parentId: '1' }
      ];
      
      mockService.getCategoryBySlug.mockResolvedValue(mockCategory);
      mockService.getSubcategories.mockResolvedValue(mockSubcategories);

      const { result } = renderHook(() => useCategoryStore());

      await act(async () => {
        await result.current.selectCategoryBySlug('electronics');
      });

      expect(result.current.selectedCategory).toEqual(mockCategory);
      expect(result.current.subcategories).toEqual(mockSubcategories);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('searchCategories', () => {
    it('should search categories successfully', async () => {
      const searchTerm = 'electronics';
      const mockSearchResults = [mockCategory];
      
      mockService.searchCategories.mockResolvedValue(mockSearchResults);

      const { result } = renderHook(() => useCategoryStore());

      await act(async () => {
        await result.current.searchCategories(searchTerm);
      });

      expect(result.current.searchTerm).toBe(searchTerm);
      expect(result.current.searchResults).toEqual(mockSearchResults);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle search error', async () => {
      const errorMessage = 'Search failed';
      mockService.searchCategories.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useCategoryStore());

      await act(async () => {
        await result.current.searchCategories('test');
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('clearSearch', () => {
    it('should clear search state', () => {
      const { result } = renderHook(() => useCategoryStore());

      // Set some search state first
      act(() => {
        useCategoryStore.setState({
          searchTerm: 'test',
          searchResults: [mockCategory]
        });
      });

      act(() => {
        result.current.clearSearch();
      });

      expect(result.current.searchTerm).toBe('');
      expect(result.current.searchResults).toEqual([]);
    });
  });

  describe('setFilters', () => {
    it('should update filters', () => {
      const { result } = renderHook(() => useCategoryStore());

      act(() => {
        result.current.setFilters({
          priceRange: { min: 10, max: 100 },
          condition: 'new'
        });
      });

      expect(result.current.filters.priceRange).toEqual({ min: 10, max: 100 });
      expect(result.current.filters.condition).toBe('new');
    });
  });

  describe('clearFilters', () => {
    it('should reset filters to initial state', () => {
      const { result } = renderHook(() => useCategoryStore());

      // Set some filters first
      act(() => {
        result.current.setFilters({
          priceRange: { min: 10, max: 100 },
          condition: 'new'
        });
      });

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.filters.priceRange).toBeUndefined();
      expect(result.current.filters.condition).toBeUndefined();
      expect(result.current.filters.datePosted).toBe('all');
      expect(result.current.filters.sortBy).toBe('newest');
    });
  });

  describe('createCategory', () => {
    it('should create category successfully', async () => {
      const categoryData = {
        name: 'New Category',
        description: 'Test description',
        createdBy: 'user1',
      };

      const createdCategory = { ...mockCategory, name: 'New Category' };
      
      mockService.createCategory.mockResolvedValue(createdCategory);
      mockService.getActiveCategories.mockResolvedValue([createdCategory]);
      mockService.getCategoriesForSelection.mockResolvedValue([]);
      mockService.getCategoryTree.mockResolvedValue([]);

      const { result } = renderHook(() => useCategoryStore());

      let returnedCategory: Category;
      await act(async () => {
        returnedCategory = await result.current.createCategory(categoryData);
      });

      expect(returnedCategory!).toEqual(createdCategory);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle create category error', async () => {
      const categoryData = {
        name: 'New Category',
        createdBy: 'user1',
      };

      const errorMessage = 'Failed to create category';
      mockService.createCategory.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useCategoryStore());

      await act(async () => {
        try {
          await result.current.createCategory(categoryData);
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      const { result } = renderHook(() => useCategoryStore());

      // Set error first
      act(() => {
        useCategoryStore.setState({ error: 'Test error' });
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      const { result } = renderHook(() => useCategoryStore());

      // Set some state first
      act(() => {
        useCategoryStore.setState({
          categories: [mockCategory],
          selectedCategory: mockCategory,
          loading: true,
          error: 'Test error',
          searchTerm: 'test',
        });
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.categories).toEqual([]);
      expect(result.current.selectedCategory).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.searchTerm).toBe('');
    });
  });
});