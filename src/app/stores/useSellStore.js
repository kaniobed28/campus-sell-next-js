import { create } from "zustand";
import { storage, db } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";

const useSellStore = create((set, get) => ({
  formData: {
    title: "",
    description: "",
    price: "",
    categoryId: "",
    subcategoryId: "",
    image: [],
  },
  selectedCategory: null,
  selectedSubcategory: null,
  uploadProgress: 0,
  isSubmitting: false,
  validationErrors: {},

  setFormData: (name, value) =>
    set((state) => ({
      formData: { ...state.formData, [name]: value },
      validationErrors: { ...state.validationErrors, [name]: "" }, // Clear error when field is updated
    })),

  setCategory: (categoryId, category) =>
    set((state) => ({
      formData: { 
        ...state.formData, 
        categoryId,
        subcategoryId: "", // Clear subcategory when category changes
      },
      selectedCategory: category,
      selectedSubcategory: null,
      validationErrors: { 
        ...state.validationErrors, 
        categoryId: "",
        subcategoryId: "",
      },
    })),

  setSubcategory: (subcategoryId, subcategory) =>
    set((state) => ({
      formData: { ...state.formData, subcategoryId },
      selectedSubcategory: subcategory,
      validationErrors: { ...state.validationErrors, subcategoryId: "" },
    })),

  setImage: (images) =>
    set((state) => ({
      formData: { ...state.formData, image: images },
      validationErrors: { ...state.validationErrors, image: "" },
    })),

  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),

  setValidationError: (field, error) =>
    set((state) => ({
      validationErrors: { ...state.validationErrors, [field]: error },
    })),

  clearValidationErrors: () => set({ validationErrors: {} }),

  validateForm: () => {
    const { formData } = get();
    const errors = {};

    // Validate title
    if (!formData.title.trim()) {
      errors.title = "Product title is required";
    } else if (formData.title.trim().length < 3) {
      errors.title = "Product title must be at least 3 characters";
    } else if (formData.title.trim().length > 100) {
      errors.title = "Product title must be less than 100 characters";
    }

    // Validate description
    if (!formData.description.trim()) {
      errors.description = "Product description is required";
    } else if (formData.description.trim().length < 10) {
      errors.description = "Product description must be at least 10 characters";
    } else if (formData.description.trim().length > 1000) {
      errors.description = "Product description must be less than 1000 characters";
    }

    // Validate price
    if (!formData.price.trim()) {
      errors.price = "Price is required";
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        errors.price = "Price must be a valid positive number";
      } else if (price > 10000) {
        errors.price = "Price must be less than $10,000";
      }
    }

    // Validate category
    if (!formData.categoryId.trim()) {
      errors.categoryId = "Please select a category";
    }

    // Validate images
    if (!formData.image || formData.image.length === 0) {
      errors.image = "At least one product image is required";
    } else if (formData.image.length > 5) {
      errors.image = "Maximum 5 images allowed";
    } else {
      // Validate image file types and sizes
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      for (const image of formData.image) {
        if (!validTypes.includes(image.type)) {
          errors.image = "Only JPEG, PNG, and WebP images are allowed";
          break;
        }
        if (image.size > maxSize) {
          errors.image = "Each image must be less than 5MB";
          break;
        }
      }
    }

    // Set all validation errors
    set({ validationErrors: errors });

    return Object.keys(errors).length === 0;
  },

  resetForm: () =>
    set({
      formData: {
        title: "",
        description: "",
        price: "",
        categoryId: "",
        subcategoryId: "",
        image: [],
      },
      selectedCategory: null,
      selectedSubcategory: null,
      uploadProgress: 0,
      isSubmitting: false,
      validationErrors: {},
    }),

  uploadImage: async (images) => {
    if (!images || images.length === 0) return [];

    const uploadPromises = images.map((image, index) => {
      const imageRef = ref(storage, `products/${Date.now()}_${index}_${image.name}`);
      const uploadTask = uploadBytesResumable(imageRef, image);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            set({ uploadProgress: progress });
          },
          (error) => reject(error),
          async () => {
            const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(imageUrl);
          }
        );
      });
    });

    const imageUrls = await Promise.all(uploadPromises);
    set({ uploadProgress: 0 });
    return imageUrls;
  },

  addProductToFirestore: async (productData) => {
    try {
      const { selectedCategory, selectedSubcategory } = get();
      
      // Build category path for breadcrumbs and navigation
      const categoryPath = [];
      const categoryNames = [];
      
      if (selectedCategory) {
        categoryPath.push(selectedCategory.id);
        categoryNames.push(selectedCategory.name);
        
        if (selectedSubcategory) {
          categoryPath.push(selectedSubcategory.id);
          categoryNames.push(selectedSubcategory.name);
        }
      }

      // Create clean product data with no undefined values
      const cleanProductData = {
        // Core product information
        title: productData.title || '',
        description: productData.description || '',
        price: productData.price || 0,
        categoryId: productData.categoryId || '',
        subcategoryId: productData.subcategoryId || null,
        imageUrls: productData.imageUrls || [],

        // User information
        createdBy: productData.createdBy || '',
        sellerEmail: productData.sellerEmail || '',
        sellerName: productData.sellerName || '',

        // Status and metadata
        status: productData.status || 'active',
        condition: productData.condition || 'good',
        location: productData.location || 'campus',

        // Analytics (using new field names for consistency)
        viewCount: productData.viewCount || 0,
        inquiryCount: productData.inquiryCount || 0,
        favoriteCount: productData.favoriteCount || 0,
        shareCount: productData.shareCount || 0,

        // Timestamps
        createdAt: productData.createdAt || new Date(),
        updatedAt: productData.updatedAt || new Date(),

        // Additional fields
        tags: productData.tags || [],
        featured: productData.featured || false,
        sold: productData.sold || false,
        
        // Category information
        categoryPath: categoryPath,
        categoryNames: categoryNames,
        categorySlug: selectedCategory?.slug || '',
        subcategorySlug: selectedSubcategory?.slug || '',
        
        // Search and discovery
        searchKeywords: [
          ...(productData.title ? productData.title.toLowerCase().split(' ') : []),
          ...(productData.description ? productData.description.toLowerCase().split(' ') : []),
          ...(selectedCategory?.name ? [selectedCategory.name.toLowerCase()] : []),
          ...(selectedSubcategory?.name ? [selectedSubcategory.name.toLowerCase()] : []),
        ].filter(keyword => keyword && keyword.length > 2), // Filter out empty and short words
        
        // Professional metadata
        productId: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        version: 1,
        lastModifiedBy: productData.createdBy || '',
        
        // Marketplace features
        negotiable: true,
        delivery: {
          available: true,
          methods: ['pickup', 'campus_delivery'],
          fee: 0,
        },
        
        // Quality assurance
        verified: false,
        reportCount: 0,
        flagged: false,
      };

      // Deep sanitization function to remove all undefined values
      const deepSanitize = (obj) => {
        if (obj === null || obj === undefined) {
          return null;
        }
        
        if (Array.isArray(obj)) {
          return obj.filter(item => item !== undefined).map(deepSanitize);
        }
        
        if (typeof obj === 'object') {
          const sanitized = {};
          for (const [key, value] of Object.entries(obj)) {
            if (value !== undefined) {
              const sanitizedValue = deepSanitize(value);
              if (sanitizedValue !== undefined) {
                sanitized[key] = sanitizedValue;
              }
            }
          }
          return sanitized;
        }
        
        return obj;
      };

      // Apply deep sanitization
      const sanitizedData = deepSanitize(cleanProductData);
      
      // Final validation - log the data being sent to Firebase
      console.log('Data being sent to Firebase:', JSON.stringify(sanitizedData, null, 2));
      
      // Validate that no undefined values exist
      const hasUndefined = JSON.stringify(sanitizedData).includes('undefined');
      if (hasUndefined) {
        console.error('WARNING: Data still contains undefined values!');
        throw new Error('Data validation failed: undefined values detected');
      }

      // Add to Firestore with fully sanitized data
      const docRef = await addDoc(collection(db, "products"), sanitizedData);
      
      // Update category product counts
      if (selectedCategory) {
        // This could be enhanced with a cloud function for better performance
        console.log(`Product added to category: ${selectedCategory.name}`);
      }
      
      return docRef.id;
      
    } catch (error) {
      console.error("Error adding product to Firestore:", error);
      throw new Error(`Failed to list product: ${error.message}`);
    }
  },
}));

export default useSellStore;

