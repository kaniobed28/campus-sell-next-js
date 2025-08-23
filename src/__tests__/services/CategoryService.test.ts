import { CategoryService } from '@/services/CategoryService';
import { CategoryRepository } from '@/repositories/CategoryRepository';
import { Category } from '@/types/category';

// Mock the CategoryRepository
jest.mock('@/repositories/CategoryRepository');

const mockCategoryRepository = CategoryRepository as jest.MockedClass<typeof CategoryRepository>;

describe('CategoryService', () => {
  let categoryService: CategoryService;
  let mockRepository: jest.Mocked<CategoryRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = new mockCategoryRepository() as jest.Mocked<CategoryRepository>;
    categoryService = new CategoryService();
    // Replace the repository instance with our mock
    (categoryService as any).categoryRepository = mockRepository;
  });

  describe('getCategoryById', () => {
    it('should return category when valid ID is provided', async () => {
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

      mockRepository.getCategoryById.mockResolvedValue(mockCategory);

      const result = await categoryService.getCategoryById('1');

      expect(result).toEqual(mockCategory);
      expect(mockRepository.getCategoryById).toHaveBeenCalledWith('1');
    });

    it('should throw error when empty ID is provided', async () => {
      await expect(categoryService.getCategoryById('')).rejects.toThrow('Category ID is required');
      expect(mockRepository.getCategoryById).not.toHaveBeenCalled();
    });

    it('should return null when category is not found', async () => {
      mockRepository.getCategoryById.mockResolvedValue(null);

      const result = await categoryService.getCategoryById('nonexistent');

      expect(result).toBeNull();
      expect(mockRepository.getCategoryById).toHaveBeenCalledWith('nonexistent');
    });
  });

  describe('createCategory', () => {
    it('should create category with valid data', async () => {
      const categoryData = {
        name: 'New Category',
        description: 'Test description',
        createdBy: 'user1',
      };

      const expectedCategory: Category = {
        id: 'generated-id',
        name: 'New Category',
        slug: 'new-category',
        description: 'Test description',
        displayOrder: 1,
        isActive: true,
        metadata: {
          productCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user1',
        },
      };

      mockRepository.getCategoryBySlug.mockResolvedValue(null);
      mockRepository.getParentCategories.mockResolvedValue([]);
      mockRepository.createCategory.mockResolvedValue(expectedCategory);

      const result = await categoryService.createCategory(categoryData);

      expect(result).toEqual(expectedCategory);
      expect(mockRepository.createCategory).toHaveBeenCalled();
    });

    it('should throw error when name is empty', async () => {
      const categoryData = {
        name: '',
        createdBy: 'user1',
      };

      await expect(categoryService.createCategory(categoryData)).rejects.toThrow('Category name is required');
      expect(mockRepository.createCategory).not.toHaveBeenCalled();
    });

    it('should throw error when createdBy is empty', async () => {
      const categoryData = {
        name: 'Valid Name',
        createdBy: '',
      };

      await expect(categoryService.createCategory(categoryData)).rejects.toThrow('Creator ID is required');
      expect(mockRepository.createCategory).not.toHaveBeenCalled();
    });

    it('should throw error when slug already exists', async () => {
      const categoryData = {
        name: 'Existing Category',
        createdBy: 'user1',
      };

      const existingCategory: Category = {
        id: 'existing-id',
        name: 'Existing Category',
        slug: 'existing-category',
        displayOrder: 1,
        isActive: true,
        metadata: {
          productCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user1',
        },
      };

      mockRepository.getCategoryBySlug.mockResolvedValue(existingCategory);

      await expect(categoryService.createCategory(categoryData)).rejects.toThrow(
        "Category with slug 'existing-category' already exists"
      );
      expect(mockRepository.createCategory).not.toHaveBeenCalled();
    });
  });

  describe('updateCategory', () => {
    it('should update category with valid data', async () => {
      const existingCategory: Category = {
        id: '1',
        name: 'Old Name',
        slug: 'old-name',
        displayOrder: 1,
        isActive: true,
        metadata: {
          productCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user1',
        },
      };

      const updates = {
        name: 'New Name',
        description: 'Updated description',
      };

      mockRepository.getCategoryById.mockResolvedValue(existingCategory);
      mockRepository.getCategoryBySlug.mockResolvedValue(null);
      mockRepository.updateCategory.mockResolvedValue();

      await categoryService.updateCategory('1', updates);

      expect(mockRepository.updateCategory).toHaveBeenCalledWith('1', expect.objectContaining({
        name: 'New Name',
        slug: 'new-name',
        description: 'Updated description',
      }));
    });

    it('should throw error when category not found', async () => {
      mockRepository.getCategoryById.mockResolvedValue(null);

      await expect(categoryService.updateCategory('nonexistent', { name: 'New Name' }))
        .rejects.toThrow('Category not found');
      expect(mockRepository.updateCategory).not.toHaveBeenCalled();
    });
  });

  describe('deleteCategory', () => {
    it('should delete category when valid', async () => {
      const category: Category = {
        id: '1',
        name: 'Category to Delete',
        slug: 'category-to-delete',
        displayOrder: 1,
        isActive: true,
        metadata: {
          productCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user1',
        },
      };

      mockRepository.getCategoryById.mockResolvedValue(category);
      mockRepository.getSubcategories.mockResolvedValue([]);
      mockRepository.deleteCategory.mockResolvedValue();

      await categoryService.deleteCategory('1');

      expect(mockRepository.deleteCategory).toHaveBeenCalledWith('1');
    });

    it('should throw error when category has products', async () => {
      const category: Category = {
        id: '1',
        name: 'Category with Products',
        slug: 'category-with-products',
        displayOrder: 1,
        isActive: true,
        metadata: {
          productCount: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user1',
        },
      };

      mockRepository.getCategoryById.mockResolvedValue(category);

      await expect(categoryService.deleteCategory('1')).rejects.toThrow(
        'Cannot delete category with existing products'
      );
      expect(mockRepository.deleteCategory).not.toHaveBeenCalled();
    });

    it('should throw error when category has subcategories', async () => {
      const category: Category = {
        id: '1',
        name: 'Parent Category',
        slug: 'parent-category',
        displayOrder: 1,
        isActive: true,
        metadata: {
          productCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user1',
        },
      };

      const subcategory: Category = {
        id: '2',
        name: 'Subcategory',
        slug: 'subcategory',
        parentId: '1',
        displayOrder: 1,
        isActive: true,
        metadata: {
          productCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user1',
        },
      };

      mockRepository.getCategoryById.mockResolvedValue(category);
      mockRepository.getSubcategories.mockResolvedValue([subcategory]);

      await expect(categoryService.deleteCategory('1')).rejects.toThrow(
        'Cannot delete category with subcategories'
      );
      expect(mockRepository.deleteCategory).not.toHaveBeenCalled();
    });
  });

  describe('searchCategories', () => {
    it('should return all active categories when search term is empty', async () => {
      const mockCategories: Category[] = [
        {
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
        },
      ];

      mockRepository.getActiveCategories.mockResolvedValue(mockCategories);

      const result = await categoryService.searchCategories('');

      expect(result).toEqual(mockCategories);
      expect(mockRepository.getActiveCategories).toHaveBeenCalled();
    });

    it('should search categories with valid term', async () => {
      const mockCategories: Category[] = [
        {
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
        },
      ];

      mockRepository.searchCategories.mockResolvedValue(mockCategories);

      const result = await categoryService.searchCategories('electronics');

      expect(result).toEqual(mockCategories);
      expect(mockRepository.searchCategories).toHaveBeenCalledWith('electronics');
    });
  });
});