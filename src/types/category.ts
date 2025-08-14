export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: string; // For hierarchical categories
  displayOrder: number;
  isActive: boolean;
  metadata: {
    productCount: number;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
  };
}

export interface CategoryAnalytics {
  categoryId: string;
  period: 'daily' | 'weekly' | 'monthly';
  metrics: {
    productViews: number;
    newListings: number;
    searchQueries: number;
    clickThroughRate: number;
  };
  timestamp: Date;
}

export interface EnhancedProduct {
  // Existing fields
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrls: string[];
  
  // Enhanced category fields
  categoryId: string;
  subcategoryId?: string;
  categoryPath: string[]; // For breadcrumb navigation
  tags: string[];
  
  // Analytics fields
  views: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryFilter {
  priceRange?: {
    min: number;
    max: number;
  };
  condition?: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  location?: string;
  datePosted?: 'today' | 'week' | 'month' | 'all';
  sortBy?: 'newest' | 'oldest' | 'price-low' | 'price-high' | 'popular';
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
  level: number;
}