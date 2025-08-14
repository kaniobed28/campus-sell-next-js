/**
 * FallbackDataProvider - Provides immediate usable data while setup completes
 * Ensures users never see empty states or setup screens
 */

// Hardcoded fallback categories that are always available
const FALLBACK_CATEGORIES = [
  {
    id: 'fallback-electronics',
    name: 'Electronics & Technology',
    slug: 'electronics-technology',
    description: 'Computers, phones, gadgets, and tech accessories',
    icon: '💻',
    displayOrder: 1,
    isActive: true,
    isFallback: true,
    children: [
      {
        id: 'fallback-phones',
        name: 'Mobile Phones',
        slug: 'mobile-phones',
        description: 'Smartphones and accessories',
        icon: '📱',
        parentId: 'fallback-electronics',
        displayOrder: 1,
        isActive: true,
        isFallback: true
      },
      {
        id: 'fallback-computers',
        name: 'Computers & Laptops',
        slug: 'computers-laptops',
        description: 'Desktop computers, laptops, and accessories',
        icon: '💻',
        parentId: 'fallback-electronics',
        displayOrder: 2,
        isActive: true,
        isFallback: true
      }
    ]
  },
  {
    id: 'fallback-fashion',
    name: 'Fashion & Accessories',
    slug: 'fashion-accessories',
    description: 'Clothing, shoes, bags, and fashion accessories',
    icon: '👕',
    displayOrder: 2,
    isActive: true,
    isFallback: true,
    children: [
      {
        id: 'fallback-clothing',
        name: 'Clothing',
        slug: 'clothing',
        description: 'Shirts, pants, dresses, and apparel',
        icon: '👔',
        parentId: 'fallback-fashion',
        displayOrder: 1,
        isActive: true,
        isFallback: true
      },
      {
        id: 'fallback-shoes',
        name: 'Shoes & Footwear',
        slug: 'shoes-footwear',
        description: 'Sneakers, boots, sandals, and footwear',
        icon: '👟',
        parentId: 'fallback-fashion',
        displayOrder: 2,
        isActive: true,
        isFallback: true
      }
    ]
  },
  {
    id: 'fallback-books',
    name: 'Books & Education',
    slug: 'books-education',
    description: 'Textbooks, study materials, and educational resources',
    icon: '📚',
    displayOrder: 3,
    isActive: true,
    isFallback: true,
    children: [
      {
        id: 'fallback-textbooks',
        name: 'Textbooks',
        slug: 'textbooks',
        description: 'Course textbooks for all subjects',
        icon: '📖',
        parentId: 'fallback-books',
        displayOrder: 1,
        isActive: true,
        isFallback: true
      }
    ]
  },
  {
    id: 'fallback-home',
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Furniture, appliances, and home essentials',
    icon: '🏠',
    displayOrder: 4,
    isActive: true,
    isFallback: true,
    children: [
      {
        id: 'fallback-furniture',
        name: 'Furniture',
        slug: 'furniture',
        description: 'Desks, chairs, beds, and dorm furniture',
        icon: '🪑',
        parentId: 'fallback-home',
        displayOrder: 1,
        isActive: true,
        isFallback: true
      }
    ]
  },
  {
    id: 'fallback-other',
    name: 'Other',
    slug: 'other',
    description: 'Items that don\'t fit in other categories',
    icon: '📦',
    displayOrder: 5,
    isActive: true,
    isFallback: true,
    children: []
  }
];

class FallbackDataProvider {
  constructor() {
    this.isUsingFallback = true;
    this.transitionCallbacks = new Set();
  }

  /**
   * Get default categories for immediate use
   */
  getDefaultCategories() {
    return FALLBACK_CATEGORIES.map(category => ({
      ...category,
      children: category.children || []
    }));
  }

  /**
   * Get flattened category list for dropdowns
   */
  getFlatCategoryList() {
    const categories = [];
    
    FALLBACK_CATEGORIES.forEach(parent => {
      categories.push(parent);
      if (parent.children) {
        categories.push(...parent.children);
      }
    });
    
    return categories;
  }

  /**
   * Get category by ID
   */
  getCategoryById(id) {
    for (const category of FALLBACK_CATEGORIES) {
      if (category.id === id) return category;
      
      if (category.children) {
        const child = category.children.find(c => c.id === id);
        if (child) return child;
      }
    }
    return null;
  }

  /**
   * Get category by slug
   */
  getCategoryBySlug(slug) {
    for (const category of FALLBACK_CATEGORIES) {
      if (category.slug === slug) return category;
      
      if (category.children) {
        const child = category.children.find(c => c.slug === slug);
        if (child) return child;
      }
    }
    return null;
  }

  /**
   * Get placeholder data for various components
   */
  getPlaceholderData() {
    return {
      categories: this.getDefaultCategories(),
      settings: {
        siteName: 'Campus Marketplace',
        currency: 'USD',
        defaultLocation: 'Campus',
        isFallback: true
      },
      stats: {
        totalProducts: '...',
        totalUsers: '...',
        totalCategories: FALLBACK_CATEGORIES.length,
        isFallback: true
      }
    };
  }

  /**
   * Check if currently using fallback data
   */
  isUsingFallbackData() {
    return this.isUsingFallback;
  }

  /**
   * Transition from fallback to real data
   */
  transitionToRealData(realData) {
    console.log('Transitioning from fallback to real data...');
    this.isUsingFallback = false;
    
    // Notify all components about the transition
    this.transitionCallbacks.forEach(callback => {
      try {
        callback(realData);
      } catch (error) {
        console.error('Error in transition callback:', error);
      }
    });
  }

  /**
   * Subscribe to data transition events
   */
  onDataTransition(callback) {
    this.transitionCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.transitionCallbacks.delete(callback);
    };
  }

  /**
   * Create a category option for forms
   */
  createCategoryOption(category) {
    return {
      value: category.id,
      label: category.name,
      slug: category.slug,
      icon: category.icon,
      isFallback: category.isFallback || false
    };
  }

  /**
   * Get category options for select dropdowns
   */
  getCategoryOptions() {
    const options = [];
    
    FALLBACK_CATEGORIES.forEach(parent => {
      // Add parent category
      options.push({
        ...this.createCategoryOption(parent),
        isParent: true
      });
      
      // Add child categories with indentation
      if (parent.children && parent.children.length > 0) {
        parent.children.forEach(child => {
          options.push({
            ...this.createCategoryOption(child),
            label: `  ${child.name}`, // Indent subcategories
            parentId: parent.id
          });
        });
      }
    });
    
    return options;
  }

  /**
   * Validate if a category ID exists in fallback data
   */
  isValidCategoryId(categoryId) {
    return this.getCategoryById(categoryId) !== null;
  }

  /**
   * Get parent category for a given category
   */
  getParentCategory(categoryId) {
    for (const parent of FALLBACK_CATEGORIES) {
      if (parent.children) {
        const child = parent.children.find(c => c.id === categoryId);
        if (child) return parent;
      }
    }
    return null;
  }
}

// Create singleton instance
export const fallbackDataProvider = new FallbackDataProvider();

// Convenience functions
export function getDefaultCategories() {
  return fallbackDataProvider.getDefaultCategories();
}

export function getCategoryOptions() {
  return fallbackDataProvider.getCategoryOptions();
}

export function isUsingFallbackData() {
  return fallbackDataProvider.isUsingFallbackData();
}

export default FallbackDataProvider;