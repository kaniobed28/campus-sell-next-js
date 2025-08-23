import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  writeBatch,
  DocumentSnapshot,
  QuerySnapshot
} from 'firebase/firestore';
import { Category } from '@/types/category';

export class CategoryRepository {
  private readonly collectionName = 'categories';
  private readonly collectionRef = collection(db, this.collectionName);

  /**
   * Get all categories
   */
  async getAllCategories(): Promise<Category[]> {
    try {
      const querySnapshot = await getDocs(
        query(this.collectionRef, orderBy('displayOrder', 'asc'))
      );
      
      return this.mapQuerySnapshotToCategories(querySnapshot);
    } catch (error) {
      console.error('Error fetching all categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  /**
   * Get active categories only
   */
  async getActiveCategories(): Promise<Category[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          this.collectionRef, 
          where('isActive', '==', true),
          orderBy('displayOrder', 'asc')
        )
      );
      
      return this.mapQuerySnapshotToCategories(querySnapshot);
    } catch (error) {
      console.error('Error fetching active categories:', error);
      throw new Error('Failed to fetch active categories');
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const docRef = doc(this.collectionRef, id);
      const docSnapshot = await getDoc(docRef);
      
      if (!docSnapshot.exists()) {
        return null;
      }
      
      return this.mapDocumentSnapshotToCategory(docSnapshot);
    } catch (error) {
      console.error('Error fetching category by ID:', error);
      throw new Error(`Failed to fetch category with ID: ${id}`);
    }
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const querySnapshot = await getDocs(
        query(this.collectionRef, where('slug', '==', slug))
      );
      
      if (querySnapshot.empty) {
        return null;
      }
      
      return this.mapDocumentSnapshotToCategory(querySnapshot.docs[0]);
    } catch (error) {
      console.error('Error fetching category by slug:', error);
      throw new Error(`Failed to fetch category with slug: ${slug}`);
    }
  }

  /**
   * Get parent categories (categories without parentId)
   */
  async getParentCategories(): Promise<Category[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          this.collectionRef,
          where('parentId', '==', null),
          where('isActive', '==', true),
          orderBy('displayOrder', 'asc')
        )
      );
      
      return this.mapQuerySnapshotToCategories(querySnapshot);
    } catch (error) {
      console.error('Error fetching parent categories:', error);
      throw new Error('Failed to fetch parent categories');
    }
  }

  /**
   * Get subcategories for a parent category
   */
  async getSubcategories(parentId: string): Promise<Category[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          this.collectionRef,
          where('parentId', '==', parentId),
          where('isActive', '==', true),
          orderBy('displayOrder', 'asc')
        )
      );
      
      return this.mapQuerySnapshotToCategories(querySnapshot);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      throw new Error(`Failed to fetch subcategories for parent: ${parentId}`);
    }
  }

  /**
   * Create a new category
   */
  async createCategory(categoryData: Omit<Category, 'id'>): Promise<Category> {
    try {
      // Validate required fields
      this.validateCategoryData(categoryData);
      
      const docRef = await addDoc(this.collectionRef, {
        ...categoryData,
        metadata: {
          ...categoryData.metadata,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });
      
      const createdCategory: Category = {
        id: docRef.id,
        ...categoryData,
        metadata: {
          ...categoryData.metadata,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      };
      
      return createdCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error('Failed to create category');
    }
  }

  /**
   * Update an existing category
   */
  async updateCategory(id: string, updates: Partial<Omit<Category, 'id'>>): Promise<void> {
    try {
      const docRef = doc(this.collectionRef, id);
      
      // Check if category exists
      const docSnapshot = await getDoc(docRef);
      if (!docSnapshot.exists()) {
        throw new Error(`Category with ID ${id} not found`);
      }
      
      await updateDoc(docRef, {
        ...updates,
        'metadata.updatedAt': new Date(),
      });
    } catch (error) {
      console.error('Error updating category:', error);
      throw new Error(`Failed to update category with ID: ${id}`);
    }
  }

  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<void> {
    try {
      const docRef = doc(this.collectionRef, id);
      
      // Check if category exists
      const docSnapshot = await getDoc(docRef);
      if (!docSnapshot.exists()) {
        throw new Error(`Category with ID ${id} not found`);
      }
      
      // Check if category has subcategories
      const subcategories = await this.getSubcategories(id);
      if (subcategories.length > 0) {
        throw new Error('Cannot delete category with existing subcategories');
      }
      
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error(`Failed to delete category with ID: ${id}`);
    }
  }

  /**
   * Update category product count
   */
  async updateProductCount(categoryId: string, count: number): Promise<void> {
    try {
      const docRef = doc(this.collectionRef, categoryId);
      await updateDoc(docRef, {
        'metadata.productCount': count,
        'metadata.updatedAt': new Date(),
      });
    } catch (error) {
      console.error('Error updating product count:', error);
      throw new Error(`Failed to update product count for category: ${categoryId}`);
    }
  }

  /**
   * Batch update category display orders
   */
  async updateCategoryOrders(categoryOrders: Array<{id: string, displayOrder: number}>): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      categoryOrders.forEach(({ id, displayOrder }) => {
        const docRef = doc(this.collectionRef, id);
        batch.update(docRef, {
          displayOrder,
          'metadata.updatedAt': new Date(),
        });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error updating category orders:', error);
      throw new Error('Failed to update category orders');
    }
  }

  /**
   * Search categories by name or description
   */
  async searchCategories(searchTerm: string): Promise<Category[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a basic implementation that gets all categories and filters client-side
      // For production, consider using Algolia or similar service
      
      const allCategories = await this.getActiveCategories();
      const searchTermLower = searchTerm.toLowerCase();
      
      return allCategories.filter(category =>
        category.name.toLowerCase().includes(searchTermLower) ||
        category.description?.toLowerCase().includes(searchTermLower) ||
        category.slug.includes(searchTermLower)
      );
    } catch (error) {
      console.error('Error searching categories:', error);
      throw new Error('Failed to search categories');
    }
  }

  /**
   * Helper method to map QuerySnapshot to Category array
   */
  private mapQuerySnapshotToCategories(querySnapshot: QuerySnapshot): Category[] {
    return querySnapshot.docs.map(doc => this.mapDocumentSnapshotToCategory(doc));
  }

  /**
   * Helper method to map DocumentSnapshot to Category
   */
  private mapDocumentSnapshotToCategory(doc: DocumentSnapshot): Category {
    const data = doc.data();
    if (!data) {
      throw new Error('Document data is undefined');
    }

    return {
      id: doc.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      icon: data.icon,
      parentId: data.parentId || undefined,
      displayOrder: data.displayOrder,
      isActive: data.isActive,
      metadata: {
        productCount: data.metadata?.productCount || 0,
        createdAt: data.metadata?.createdAt?.toDate() || new Date(),
        updatedAt: data.metadata?.updatedAt?.toDate() || new Date(),
        createdBy: data.metadata?.createdBy || 'unknown',
      },
    };
  }

  /**
   * Validate category data before operations
   */
  private validateCategoryData(categoryData: Partial<Category>): void {
    if (!categoryData.name || categoryData.name.trim().length === 0) {
      throw new Error('Category name is required');
    }
    
    if (!categoryData.slug || categoryData.slug.trim().length === 0) {
      throw new Error('Category slug is required');
    }
    
    if (categoryData.displayOrder === undefined || categoryData.displayOrder < 0) {
      throw new Error('Valid display order is required');
    }
  }
}