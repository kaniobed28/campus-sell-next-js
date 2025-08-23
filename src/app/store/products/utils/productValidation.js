/**
 * Product form validation utilities
 */

export const validateProductForm = (formData, options = {}) => {
  const errors = {};
  const { requireImages = false } = options;

  // Title validation
  if (!formData.title || !formData.title.trim()) {
    errors.title = "Product title is required";
  } else if (formData.title.trim().length < 3) {
    errors.title = "Title must be at least 3 characters long";
  } else if (formData.title.trim().length > 100) {
    errors.title = "Title cannot exceed 100 characters";
  }

  // Description validation
  if (!formData.description || !formData.description.trim()) {
    errors.description = "Product description is required";
  } else if (formData.description.trim().length < 10) {
    errors.description = "Description must be at least 10 characters long";
  } else if (formData.description.trim().length > 2000) {
    errors.description = "Description cannot exceed 2000 characters";
  }

  // Price validation
  const price = parseFloat(formData.price);
  if (!formData.price || isNaN(price) || price <= 0) {
    errors.price = "Please enter a valid price greater than $0";
  } else if (price > 10000) {
    errors.price = "Price cannot exceed $10,000";
  } else if (price < 0.01) {
    errors.price = "Price must be at least $0.01";
  }

  // Category validation
  if (!formData.categoryId || !formData.categoryId.trim()) {
    errors.categoryId = "Please select a category";
  }

  // Images validation
  if (requireImages) {
    if (!formData.images || formData.images.length === 0) {
      errors.images = "Please add at least one image";
    } else if (formData.images.length > 5) {
      errors.images = "Maximum 5 images allowed";
    }
  }

  // Tags validation
  if (formData.tags && formData.tags.length > 10) {
    errors.tags = "Maximum 10 tags allowed";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const sanitizeProductData = (formData) => {
  return {
    title: formData.title?.trim() || "",
    description: formData.description?.trim() || "",
    price: parseFloat(formData.price) || 0,
    categoryId: formData.categoryId?.trim() || "",
    subcategoryId: formData.subcategoryId?.trim() || null,
    category: formData.category?.trim() || "",
    subcategory: formData.subcategory?.trim() || "",
    status: formData.status || "active",
    tags: Array.isArray(formData.tags) ? formData.tags.filter(tag => tag.trim().length > 0) : []
  };
};

export const formatPrice = (price) => {
  const numPrice = parseFloat(price);
  if (isNaN(numPrice)) return "";
  return numPrice.toFixed(2);
};

export const validateImageFile = (file) => {
  const errors = [];
  
  // File type validation
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    errors.push("Only JPEG, PNG, and WebP images are allowed");
  }
  
  // File size validation (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    errors.push("Image size must be less than 5MB");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateImageFiles = (files) => {
  const errors = [];
  
  if (!files || files.length === 0) {
    return { isValid: true, errors: [] };
  }
  
  if (files.length > 5) {
    errors.push("Maximum 5 images allowed");
    return { isValid: false, errors };
  }
  
  for (let i = 0; i < files.length; i++) {
    const fileValidation = validateImageFile(files[i]);
    if (!fileValidation.isValid) {
      errors.push(`Image ${i + 1}: ${fileValidation.errors.join(", ")}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const generateProductSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

export const extractKeywordsFromProduct = (productData) => {
  const keywords = new Set();
  
  // Add words from title
  if (productData.title) {
    productData.title.toLowerCase().split(/\s+/).forEach(word => {
      if (word.length > 2) keywords.add(word);
    });
  }
  
  // Add words from description
  if (productData.description) {
    productData.description.toLowerCase().split(/\s+/).forEach(word => {
      if (word.length > 2) keywords.add(word);
    });
  }
  
  // Add category and subcategory
  if (productData.category) {
    keywords.add(productData.category.toLowerCase());
  }
  if (productData.subcategory) {
    keywords.add(productData.subcategory.toLowerCase());
  }
  
  // Add tags
  if (productData.tags) {
    productData.tags.forEach(tag => {
      if (tag.trim().length > 0) {
        keywords.add(tag.toLowerCase().trim());
      }
    });
  }
  
  return Array.from(keywords);
};