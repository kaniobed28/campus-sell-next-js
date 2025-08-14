import { CategoryRepository } from '@/repositories/CategoryRepository';
import { Category, CategoryTreeNode } from '@/types/category';
import { 
  buildCategoryTree, 
  getCategoryPath, 
  getCategoryBreadcrumbs,
  generateCategorySlug,
  validateCategoryHierarchy 
} from '@/utils/categoryUtils';

export class CategoryService {
  private categoryRepository: CategoryRepository;

  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  /**
   * Get all categories as a hierarchical tree
   */
  async getCategoryTree(): Promise<CategoryTreeNode[]> {
    try {
      const categories = await this.categoryRepository.getActiveCategories();
      return buildCategoryTree(categories);
    } catch (error) {
      console.error('Error building category tree:', error);
      throw new Error('Failed to get category tree');
    }
  }

  /**
   * Get all categories (flat list)
   */
  async getAllCategories(): Promise<Category[]> {
    try {
      return await this.categoryRepository.getAllCategories();
    } catch (error) {
      console.error('Error getting all categories:', error);
      throw error;
    }
  }

  /**
   * Get active categories only
   */
  async getActiveCategories(): Promise<Category[]> {
    try {
      return await this.categoryRepository.getActiveCategories();
    } catch (error) {
      console.error('Error getting active categories:', error);
      throw error;
    }
  }

  /**
   * Get category by ID with validation
   */
  async getCategoryById(id: string): Promise<Category | null> {
    try {
      if (!id || id.trim().length === 0) {
        throw new Error('Category ID is required');
      }
      
      return await this.categoryRepository.getCategoryById(id);
    } catch (error) {
      console.error('Error getting category by ID:', error);
      throw error;
    }
  }

  /**
   * Get category by slug with validation
   */
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      if (!slug || slug.trim().length === 0) {
        throw new Error('Category slug is required');
      }
      
      return await this.categoryRepository.getCategoryBySlug(slug);
    } catch (error) {
      console.error('Error getting category by slug:', error);
      throw error;
    }
  }

  /**
   * Get parent categories for navigation
   */
  async getParentCategories(): Promise<Category[]> {
    try {
      return await this.categoryRepository.getParentCategories();
    } catch (error) {
      console.error('Error getting parent categories:', error);
      throw error;
    }
  }

  /**
   * Get subcategories for a parent category
   */
  async getSubcategories(parentId: string): Promise<Category[]> {
    try {
      if (!parentId || parentId.trim().length === 0) {
        throw new Error('Parent category ID is required');
      }
      
      return await this.categoryRepository.getSubcategories(parentId);
    } catch (error) {
      console.error('Error getting subcategories:', error);
      throw error;
    }
  }

  /**
   * Create a new category with business logic validation
   */
  async createCategory(categoryData: {
    name: string;
    description?: string;
    icon?: string;
    parentId?: string;
    displayOrder?: number;
    createdBy: string;
  }): Promise<Category> {
    try {
      // Validate input
      if (!categoryData.name || categoryData.name.trim().length === 0) {
        throw new Error('Category name is required');
      }

      if (!categoryData.createdBy || categoryData.createdBy.trim().length === 0) {
        throw new Error('Creator ID is required');
      }

      // Generate slug from name
      const slug = generateCategorySlug(categoryData.name);
      
      // Check if slug already exists
      const existingCategory = await this.categoryRepository.getCategoryBySlug(slug);
      if (existingCategory) {
        throw new Error(`Category with slug '${slug}' already exists`);
      }

      // Validate parent category if provided
      if (categoryData.parentId) {
        const parentCategory = await this.categoryRepository.getCategoryById(categoryData.parentId);
        if (!parentCategory) {
          throw new Error('Parent category not found');
        }
        if (!parentCategory.isActive) {
          throw new Error('Cannot create subcategory under inactive parent');
        }
      }

      // Set default display order if not provided
      const displayOrder = categoryData.displayOrder ?? await this.getNextDisplayOrder(categoryData.parentId);

      const newCategory: Omit<Category, 'id'> = {
        name: categoryData.name.trim(),
        slug,
        description: categoryData.description?.trim(),
        icon: categoryData.icon,
        parentId: categoryData.parentId,
        displayOrder,
        isActive: true,
        metadata: {
          productCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: categoryData.createdBy,
        },
      };

      return await this.categoryRepository.createCategory(newCategory);
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  /**
   * Update an existing category
   */
  async updateCategory(
    id: string, 
    updates: {
      name?: string;
      description?: string;
      icon?: string;
      displayOrder?: number;
      isActive?: boolean;
    }
  ): Promise<void> {
    try {
      if (!id || id.trim().length === 0) {
        throw new Error('Category ID is required');
      }

      // Get existing category
      const existingCategory = await this.categoryRepository.getCategoryById(id);
      if (!existingCategory) {
        throw new Error('Category not found');
      }

      const updateData: Partial<Omit<Category, 'id'>> = {};

      // Update name and regenerate slug if name changed
      if (updates.name && updates.name !== existingCategory.name) {
        const newSlug = generateCategorySlug(updates.name);
        
        // Check if new slug conflicts with existing categories
        const existingWithSlug = await this.categoryRepository.getCategoryBySlug(newSlug);
        if (existingWithSlug && existingWithSlug.id !== id) {
          throw new Error(`Category with slug '${newSlug}' already exists`);
        }
        
        updateData.name = updates.name.trim();
        updateData.slug = newSlug;
      }

      // Update other fields
      if (updates.description !== undefined) {
        updateData.description = updates.description?.trim();
      }
      
      if (updates.icon !== undefined) {
        updateData.icon = updates.icon;
      }
      
      if (updates.displayOrder !== undefined) {
        updateData.displayOrder = updates.displayOrder;
      }
      
      if (updates.isActive !== undefined) {
        updateData.isActive = updates.isActive;
        
        // If deactivating, also deactivate subcategories
        if (!updates.isActive) {
          await this.deactivateSubcategories(id);
        }
      }

      await this.categoryRepository.updateCategory(id, updateData);
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  /**
   * Delete a category with business logic validation
   */
  async deleteCategory(id: string): Promise<void> {
    try {
      if (!id || id.trim().length === 0) {
        throw new Error('Category ID is required');
      }

      // Get category to check if it exists and has products
      const category = await this.categoryRepository.getCategoryById(id);
      if (!category) {
        throw new Error('Category not found');
      }

      // Check if category has products
      if (category.metadata.productCount > 0) {
        throw new Error('Cannot delete category with existing products. Please move or delete products first.');
      }

      // Check if category has subcategories
      const subcategories = await this.categoryRepository.getSubcategories(id);
      if (subcategories.length > 0) {
        throw new Error('Cannot delete category with subcategories. Please delete subcategories first.');
      }

      await this.categoryRepository.deleteCategory(id);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  /**
   * Get category breadcrumbs for navigation
   */
  async getCategoryBreadcrumbs(categoryId: string): Promise<Array<{id: string, name: string, slug: string}>> {
    try {
      const categories = await this.categoryRepository.getAllCategories();
      return getCategoryBreadcrumbs(categoryId, categories);
    } catch (error) {
      console.error('Error getting category breadcrumbs:', error);
      throw error;
    }
  }

  /**
   * Search categories with enhanced logic
   */
  async searchCategories(searchTerm: string): Promise<Category[]> {
    try {
      if (!searchTerm || searchTerm.trim().length === 0) {
        return await this.getActiveCategories();
      }

      return await this.categoryRepository.searchCategories(searchTerm.trim());
    } catch (error) {
      console.error('Error searching categories:', error);
      throw error;
    }
  }

  /**
   * Update category product count
   */
  async updateCategoryProductCount(categoryId: string, count: number): Promise<void> {
    try {
      if (count < 0) {
        throw new Error('Product count cannot be negative');
      }

      await this.categoryRepository.updateProductCount(categoryId, count);
    } catch (error) {
      console.error('Error updating category product count:', error);
      throw error;
    }
  }

  /**
   * Reorder categories
   */
  async reorderCategories(categoryOrders: Array<{id: string, displayOrder: number}>): Promise<void> {
    try {
      // Validate input
      if (!categoryOrders || categoryOrders.length === 0) {
        throw new Error('Category orders array is required');
      }

      // Validate all categories exist
      for (const order of categoryOrders) {
        const category = await this.categoryRepository.getCategoryById(order.id);
        if (!category) {
          throw new Error(`Category with ID ${order.id} not found`);
        }
      }

      await this.categoryRepository.updateCategoryOrders(categoryOrders);
    } catch (error) {
      console.error('Error reordering categories:', error);
      throw error;
    }
  }

  /**
   * Validate category hierarchy to prevent circular references
   */
  async validateHierarchy(): Promise<boolean> {
    try {
      const categories = await this.categoryRepository.getAllCategories();
      return validateCategoryHierarchy(categories);
    } catch (error) {
      console.error('Error validating category hierarchy:', error);
      throw error;
    }
  }

  /**
   * Get categories suitable for product selection (flat list with indentation)
   */
  async getCategoriesForSelection(): Promise<Array<{id: string, name: string, level: number, disabled?: boolean}>> {
    try {
      const tree = await this.getCategoryTree();
      const flatList: Array<{id: string, name: string, level: number, disabled?: boolean}> = [];
      
      function addToFlatList(node: CategoryTreeNode) {
        flatList.push({
          id: node.id,
          name: node.name,
          level: node.level,
          disabled: !node.isActive
        });
        
        node.children.forEach(child => addToFlatList(child));
      }
      
      tree.forEach(rootCategory => addToFlatList(rootCategory));
      
      return flatList;
    } catch (error) {
      console.error('Error getting categories for selection:', error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */

  private async getNextDisplayOrder(parentId?: string): Promise<number> {
    try {
      const siblings = parentId 
        ? await this.categoryRepository.getSubcategories(parentId)
        : await this.categoryRepository.getParentCategories();
      
      if (siblings.length === 0) {
        return 1;
      }
      
      const maxOrder = Math.max(...siblings.map(cat => cat.displayOrder));
      return maxOrder + 1;
    } catch (error) {
      console.error('Error getting next display order:', error);
      return 1;
    }
  }

  private async deactivateSubcategories(parentId: string): Promise<void> {
    try {
      const subcategories = await this.categoryRepository.getSubcategories(parentId);
      
      for (const subcategory of subcategories) {
        await this.categoryRepository.updateCategory(subcategory.id, { isActive: false });
        
        // Recursively deactivate nested subcategories
        await this.deactivateSubcategories(subcategory.id);
      }
    } catch (error) {
      console.error('Error deactivating subcategories:', error);
      throw error;
    }
  }
}