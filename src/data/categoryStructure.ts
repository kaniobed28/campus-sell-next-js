import { Category } from '@/types/category';

// Improved category structure for better browsing experience
export const defaultCategoryStructure: Omit<Category, 'id' | 'metadata'>[] = [
  // Electronics & Technology
  {
    name: 'Electronics & Technology',
    slug: 'electronics-technology',
    description: 'Computers, phones, gadgets, and tech accessories',
    icon: '💻',
    displayOrder: 1,
    isActive: true,
  },
  {
    name: 'Mobile Phones & Accessories',
    slug: 'mobile-phones-accessories',
    description: 'Smartphones, cases, chargers, and mobile accessories',
    icon: '📱',
    parentId: 'electronics-technology',
    displayOrder: 1,
    isActive: true,
  },
  {
    name: 'Computers & Laptops',
    slug: 'computers-laptops',
    description: 'Desktop computers, laptops, tablets, and computer accessories',
    icon: '💻',
    parentId: 'electronics-technology',
    displayOrder: 2,
    isActive: true,
  },
  {
    name: 'Gaming & Entertainment',
    slug: 'gaming-entertainment',
    description: 'Gaming consoles, games, headphones, and entertainment devices',
    icon: '🎮',
    parentId: 'electronics-technology',
    displayOrder: 3,
    isActive: true,
  },
  {
    name: 'Audio & Video',
    slug: 'audio-video',
    description: 'Speakers, headphones, cameras, and audio/video equipment',
    icon: '🎧',
    parentId: 'electronics-technology',
    displayOrder: 4,
    isActive: true,
  },

  // Fashion & Accessories
  {
    name: 'Fashion & Accessories',
    slug: 'fashion-accessories',
    description: 'Clothing, shoes, bags, and fashion accessories',
    icon: '👕',
    displayOrder: 2,
    isActive: true,
  },
  {
    name: 'Men\'s Clothing',
    slug: 'mens-clothing',
    description: 'Shirts, pants, jackets, and men\'s fashion',
    icon: '👔',
    parentId: 'fashion-accessories',
    displayOrder: 1,
    isActive: true,
  },
  {
    name: 'Women\'s Clothing',
    slug: 'womens-clothing',
    description: 'Dresses, tops, pants, and women\'s fashion',
    icon: '👗',
    parentId: 'fashion-accessories',
    displayOrder: 2,
    isActive: true,
  },
  {
    name: 'Shoes & Footwear',
    slug: 'shoes-footwear',
    description: 'Sneakers, boots, sandals, and all types of footwear',
    icon: '👟',
    parentId: 'fashion-accessories',
    displayOrder: 3,
    isActive: true,
  },
  {
    name: 'Bags & Accessories',
    slug: 'bags-accessories',
    description: 'Backpacks, handbags, jewelry, and fashion accessories',
    icon: '🎒',
    parentId: 'fashion-accessories',
    displayOrder: 4,
    isActive: true,
  },

  // Books & Education
  {
    name: 'Books & Education',
    slug: 'books-education',
    description: 'Textbooks, study materials, and educational resources',
    icon: '📚',
    displayOrder: 3,
    isActive: true,
  },
  {
    name: 'Textbooks',
    slug: 'textbooks',
    description: 'Course textbooks for all subjects and levels',
    icon: '📖',
    parentId: 'books-education',
    displayOrder: 1,
    isActive: true,
  },
  {
    name: 'Study Materials',
    slug: 'study-materials',
    description: 'Notes, guides, calculators, and study aids',
    icon: '📝',
    parentId: 'books-education',
    displayOrder: 2,
    isActive: true,
  },
  {
    name: 'Reference Books',
    slug: 'reference-books',
    description: 'Dictionaries, encyclopedias, and reference materials',
    icon: '📋',
    parentId: 'books-education',
    displayOrder: 3,
    isActive: true,
  },

  // Home & Living
  {
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Furniture, appliances, and home essentials',
    icon: '🏠',
    displayOrder: 4,
    isActive: true,
  },
  {
    name: 'Furniture',
    slug: 'furniture',
    description: 'Desks, chairs, beds, and dorm furniture',
    icon: '🪑',
    parentId: 'home-living',
    displayOrder: 1,
    isActive: true,
  },
  {
    name: 'Kitchen & Appliances',
    slug: 'kitchen-appliances',
    description: 'Kitchen appliances, cookware, and dining essentials',
    icon: '🍳',
    parentId: 'home-living',
    displayOrder: 2,
    isActive: true,
  },
  {
    name: 'Decor & Storage',
    slug: 'decor-storage',
    description: 'Room decor, storage solutions, and organization items',
    icon: '🖼️',
    parentId: 'home-living',
    displayOrder: 3,
    isActive: true,
  },

  // Sports & Recreation
  {
    name: 'Sports & Recreation',
    slug: 'sports-recreation',
    description: 'Sports equipment, fitness gear, and recreational items',
    icon: '⚽',
    displayOrder: 5,
    isActive: true,
  },
  {
    name: 'Fitness & Exercise',
    slug: 'fitness-exercise',
    description: 'Gym equipment, weights, and fitness accessories',
    icon: '🏋️',
    parentId: 'sports-recreation',
    displayOrder: 1,
    isActive: true,
  },
  {
    name: 'Team Sports',
    slug: 'team-sports',
    description: 'Equipment for football, basketball, soccer, and team sports',
    icon: '🏀',
    parentId: 'sports-recreation',
    displayOrder: 2,
    isActive: true,
  },
  {
    name: 'Outdoor Activities',
    slug: 'outdoor-activities',
    description: 'Camping, hiking, biking, and outdoor recreation gear',
    icon: '🏕️',
    parentId: 'sports-recreation',
    displayOrder: 3,
    isActive: true,
  },

  // Food & Beverages
  {
    name: 'Food & Beverages',
    slug: 'food-beverages',
    description: 'Snacks, drinks, and food items',
    icon: '🍕',
    displayOrder: 6,
    isActive: true,
  },
  {
    name: 'Snacks & Treats',
    slug: 'snacks-treats',
    description: 'Chips, candy, cookies, and snack foods',
    icon: '🍿',
    parentId: 'food-beverages',
    displayOrder: 1,
    isActive: true,
  },
  {
    name: 'Beverages',
    slug: 'beverages',
    description: 'Coffee, tea, energy drinks, and beverages',
    icon: '☕',
    parentId: 'food-beverages',
    displayOrder: 2,
    isActive: true,
  },
  {
    name: 'Meal Plans & Dining',
    slug: 'meal-plans-dining',
    description: 'Meal plan transfers and dining credits',
    icon: '🍽️',
    parentId: 'food-beverages',
    displayOrder: 3,
    isActive: true,
  },

  // Services
  {
    name: 'Services',
    slug: 'services',
    description: 'Tutoring, repairs, and various campus services',
    icon: '🛠️',
    displayOrder: 7,
    isActive: true,
  },
  {
    name: 'Tutoring & Academic Help',
    slug: 'tutoring-academic-help',
    description: 'Subject tutoring, exam prep, and academic assistance',
    icon: '👨‍🏫',
    parentId: 'services',
    displayOrder: 1,
    isActive: true,
  },
  {
    name: 'Tech Support & Repairs',
    slug: 'tech-support-repairs',
    description: 'Computer repair, phone repair, and tech support services',
    icon: '🔧',
    parentId: 'services',
    displayOrder: 2,
    isActive: true,
  },
  {
    name: 'Transportation',
    slug: 'transportation',
    description: 'Ride sharing, bike rentals, and transportation services',
    icon: '🚗',
    parentId: 'services',
    displayOrder: 3,
    isActive: true,
  },
  {
    name: 'Event Services',
    slug: 'event-services',
    description: 'Party planning, photography, and event-related services',
    icon: '🎉',
    parentId: 'services',
    displayOrder: 4,
    isActive: true,
  },

  // Vehicles & Transportation
  {
    name: 'Vehicles & Transportation',
    slug: 'vehicles-transportation',
    description: 'Bikes, scooters, and transportation equipment',
    icon: '🚲',
    displayOrder: 8,
    isActive: true,
  },
  {
    name: 'Bicycles',
    slug: 'bicycles',
    description: 'Bikes, bike accessories, and cycling equipment',
    icon: '🚴',
    parentId: 'vehicles-transportation',
    displayOrder: 1,
    isActive: true,
  },
  {
    name: 'Scooters & E-bikes',
    slug: 'scooters-ebikes',
    description: 'Electric scooters, e-bikes, and personal mobility devices',
    icon: '🛴',
    parentId: 'vehicles-transportation',
    displayOrder: 2,
    isActive: true,
  },
  {
    name: 'Car Accessories',
    slug: 'car-accessories',
    description: 'Car accessories, parking passes, and automotive items',
    icon: '🚙',
    parentId: 'vehicles-transportation',
    displayOrder: 3,
    isActive: true,
  },

  // Miscellaneous
  {
    name: 'Miscellaneous',
    slug: 'miscellaneous',
    description: 'Other items that don\'t fit in specific categories',
    icon: '📦',
    displayOrder: 9,
    isActive: true,
  },
  {
    name: 'Free Items',
    slug: 'free-items',
    description: 'Items being given away for free',
    icon: '🆓',
    parentId: 'miscellaneous',
    displayOrder: 1,
    isActive: true,
  },
  {
    name: 'Lost & Found',
    slug: 'lost-found',
    description: 'Lost items and found items listings',
    icon: '🔍',
    parentId: 'miscellaneous',
    displayOrder: 2,
    isActive: true,
  },
  {
    name: 'Other',
    slug: 'other',
    description: 'Items that don\'t fit in any other category',
    icon: '❓',
    parentId: 'miscellaneous',
    displayOrder: 3,
    isActive: true,
  },
];

// Helper function to build category tree
export function buildCategoryTree(categories: Category[]): Category[] {
  const categoryMap = new Map<string, Category & { children: Category[] }>();
  const rootCategories: (Category & { children: Category[] })[] = [];

  // First pass: create all categories with children array
  categories.forEach(category => {
    categoryMap.set(category.id, { ...category, children: [] });
  });

  // Second pass: build the tree structure
  categories.forEach(category => {
    const categoryWithChildren = categoryMap.get(category.id)!;
    
    if (category.parentId) {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        parent.children.push(categoryWithChildren);
      }
    } else {
      rootCategories.push(categoryWithChildren);
    }
  });

  // Sort categories by displayOrder
  const sortByDisplayOrder = (a: Category, b: Category) => a.displayOrder - b.displayOrder;
  
  rootCategories.sort(sortByDisplayOrder);
  rootCategories.forEach(category => {
    category.children.sort(sortByDisplayOrder);
  });

  return rootCategories;
}

// Helper function to get category path for breadcrumbs
export function getCategoryPath(categoryId: string, categories: Category[]): string[] {
  const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
  const path: string[] = [];
  
  let currentCategory = categoryMap.get(categoryId);
  while (currentCategory) {
    path.unshift(currentCategory.name);
    currentCategory = currentCategory.parentId ? categoryMap.get(currentCategory.parentId) : undefined;
  }
  
  return path;
}

// Helper function to generate category slug
export function generateCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}