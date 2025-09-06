import { Category, CategoryTreeNode } from '@/types/category';

/**
 * Build a hierarchical tree structure from flat category array
 */
export function buildCategoryTree(categories: Category[]): CategoryTreeNode[] {
  const categoryMap = new Map<string, CategoryTreeNode>();
  const rootCategories: CategoryTreeNode[] = [];

  // First pass: create all categories with children array and level
  categories.forEach(category => {
    categoryMap.set(category.id, { 
      ...category, 
      children: [], 
      level: 0 
    });
  });

  // Second pass: build the tree structure and set levels
  categories.forEach(category => {
    const categoryWithChildren = categoryMap.get(category.id)!;
    
    if (category.parentId) {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        categoryWithChildren.level = parent.level + 1;
        parent.children.push(categoryWithChildren);
      }
    } else {
      rootCategories.push(categoryWithChildren);
    }
  });

  // Sort categories by displayOrder
  const sortByDisplayOrder = (a: CategoryTreeNode, b: CategoryTreeNode) => 
    a.displayOrder - b.displayOrder;
  
  rootCategories.sort(sortByDisplayOrder);
  rootCategories.forEach(category => {
    sortCategoryChildren(category);
  });

  return rootCategories;
}

/**
 * Recursively sort category children by display order
 */
function sortCategoryChildren(category: CategoryTreeNode): void {
  category.children.sort((a, b) => a.displayOrder - b.displayOrder);
  category.children.forEach(child => sortCategoryChildren(child));
}

/**
 * Get category path for breadcrumbs
 */
export function getCategoryPath(categoryId: string, categories: Category[]): string[] {
  const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
  const path: string[] = [];
  
  let currentCategory = categoryMap.get(categoryId);
  while (currentCategory) {
    path.unshift(currentCategory.name);
    currentCategory = currentCategory.parentId ? 
      categoryMap.get(currentCategory.parentId) : undefined;
  }
  
  return path;
}

/**
 * Get category breadcrumb objects with IDs and names
 */
export function getCategoryBreadcrumbs(categoryId: string, categories: Category[]): Array<{id: string, name: string, slug: string}> {
  const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
  const breadcrumbs: Array<{id: string, name: string, slug: string}> = [];
  
  let currentCategory = categoryMap.get(categoryId);
  while (currentCategory) {
    breadcrumbs.unshift({
      id: currentCategory.id,
      name: currentCategory.name,
      slug: currentCategory.slug
    });
    currentCategory = currentCategory.parentId ? 
      categoryMap.get(currentCategory.parentId) : undefined;
  }
  
  return breadcrumbs;
}

/**
 * Generate category slug from name
 */
export function generateCategorySlug(name: string): string {
  // Handle null, undefined or non-string values
  if (!name || typeof name !== 'string') {
    return '';
  }
  
  return name
    .trim() // Trim leading/trailing whitespace first
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Find category by slug
 */
export function findCategoryBySlug(slug: string, categories: Category[]): Category | undefined {
  return categories.find(cat => cat.slug === slug);
}

/**
 * Get all subcategories for a parent category
 */
export function getSubcategories(parentId: string, categories: Category[]): Category[] {
  return categories
    .filter(cat => cat.parentId === parentId)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Get all categories in a flat array (useful for dropdowns)
 */
export function getFlatCategoryList(categories: Category[]): Array<{id: string, name: string, level: number}> {
  const tree = buildCategoryTree(categories);
  const flatList: Array<{id: string, name: string, level: number}> = [];
  
  function addToFlatList(node: CategoryTreeNode) {
    flatList.push({
      id: node.id,
      name: node.name,
      level: node.level
    });
    
    node.children.forEach(child => addToFlatList(child));
  }
  
  tree.forEach(rootCategory => addToFlatList(rootCategory));
  
  return flatList;
}

/**
 * Validate category hierarchy (prevent circular references)
 */
export function validateCategoryHierarchy(categories: Category[]): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  function hasCycle(categoryId: string): boolean {
    if (recursionStack.has(categoryId)) {
      return true; // Cycle detected
    }
    
    if (visited.has(categoryId)) {
      return false; // Already processed
    }
    
    visited.add(categoryId);
    recursionStack.add(categoryId);
    
    const category = categories.find(cat => cat.id === categoryId);
    if (category?.parentId) {
      if (hasCycle(category.parentId)) {
        return true;
      }
    }
    
    recursionStack.delete(categoryId);
    return false;
  }
  
  // Check all categories for cycles
  for (const category of categories) {
    if (!visited.has(category.id)) {
      if (hasCycle(category.id)) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Search categories by name or description
 */
export function searchCategories(query: string, categories: Category[]): Category[] {
  const searchTerm = query.toLowerCase().trim();
  
  if (!searchTerm) {
    return categories;
  }
  
  return categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm) ||
    category.description?.toLowerCase().includes(searchTerm) ||
    category.slug.includes(searchTerm)
  );
}

/**
 * Get category statistics
 */
export function getCategoryStats(categories: Category[]): {
  totalCategories: number;
  parentCategories: number;
  subcategories: number;
  totalProducts: number;
} {
  const parentCategories = categories.filter(cat => !cat.parentId);
  const subcategories = categories.filter(cat => cat.parentId);
  const totalProducts = categories.reduce((sum, cat) => sum + cat.metadata.productCount, 0);
  
  return {
    totalCategories: categories.length,
    parentCategories: parentCategories.length,
    subcategories: subcategories.length,
    totalProducts
  };
}