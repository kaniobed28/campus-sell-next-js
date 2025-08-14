"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import useSellStore from "../stores/useSellStore";
import ProgressiveCategorySelector from "@/components/ProgressiveCategorySelector";
import InputField from "./components/InputField";
import TextAreaField from "./components/TextAreaField";
import FileUpload from "./components/FileUpload";
import ProgressBar from "./components/ProgressBar";
import { Button } from "../../components/ui/Button";
import { autoSetupManager } from "@/lib/autoSetup";
import { loadCategoryOptions } from "@/lib/progressiveLoader";

const SellPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [setupProgress, setSetupProgress] = useState({ progress: 0, isComplete: false });
  const [categoryOptions, setCategoryOptions] = useState([]);
  
  // Mock notification functions for now
  const showSuccess = (title, message) => {
    console.log('Success:', title, message);
    alert(`Success: ${title}\n${message}`);
  };
  const showError = (title, message) => {
    console.log('Error:', title, message);
    alert(`Error: ${title}\n${message}`);
  };
  const showWarning = (title, message) => {
    console.log('Warning:', title, message);
    alert(`Warning: ${title}\n${message}`);
  };

  const {
    formData,
    selectedCategory,
    selectedSubcategory,
    uploadProgress,
    isSubmitting,
    validationErrors,
    setFormData,
    setCategory,
    setSubcategory,
    setImage,
    validateForm,
    resetForm,
    uploadImage,
    addProductToFirestore,
  } = useSellStore();

  const router = useRouter();

  // Check authentication and initialize system on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (!currentUser) {
        showWarning(
          "Authentication Required",
          "Please sign in to list products on the marketplace."
        );
        router.push("/auth");
        return;
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Initialize system and load categories when user is authenticated
  useEffect(() => {
    if (user) {
      initializeSystem();
    }
  }, [user]);

  // Initialize system in background
  const initializeSystem = async () => {
    try {
      console.log('Initializing system in background...');
      
      // Subscribe to setup progress
      const unsubscribe = autoSetupManager.onSetupProgress((progress) => {
        setSetupProgress(progress);
      });

      // Start system initialization (non-blocking)
      autoSetupManager.ensureSystemReady().catch(error => {
        console.warn('System setup failed, but continuing with fallback:', error);
      });

      // Load category options (with fallback)
      const options = await loadCategoryOptions();
      setCategoryOptions(options);

      return unsubscribe;
    } catch (error) {
      console.error('Error initializing system:', error);
      // Continue with fallback data
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show subtle setup progress if system is still initializing
  const renderSetupProgress = () => {
    if (setupProgress.isComplete) return null;
    
    return (
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <div className="flex-1">
            <p className="text-sm text-blue-800">
              Setting up marketplace... ({setupProgress.progress}%)
            </p>
            <div className="w-full bg-blue-200 rounded-full h-1.5 mt-1">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                style={{ width: `${setupProgress.progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(name, value);
  };

  const handleCategoryChange = (categoryId, category) => {
    console.log('Category changed:', categoryId, category);
    setCategory(categoryId, category);
  };

  const handleSubcategoryChange = (subcategoryId, subcategory) => {
    console.log('Subcategory changed:', subcategoryId, subcategory);
    setSubcategory(subcategoryId, subcategory);
  };

  const handleImageChange = (files) => {
    setImage(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Double-check authentication
    if (!user) {
      showError("Authentication Error", "Please sign in to list products.");
      router.push("/auth");
      return;
    }

    // Validate form before submission
    if (!validateForm()) {
      console.log('Form validation failed. Current formData:', formData);
      console.log('Validation errors:', validationErrors);
      showError(
        "Form Validation Failed",
        "Please check the form for errors and try again."
      );
      return;
    }

    try {
      // Upload images first
      const imageUrls = await uploadImage(formData.image);

      // Create comprehensive product data with explicit validation
      const productData = {
        title: formData.title?.trim() || '',
        description: formData.description?.trim() || '',
        price: parseFloat(formData.price) || 0,
        categoryId: formData.categoryId || '',
        subcategoryId: formData.subcategoryId || null,
        imageUrls: imageUrls || [],

        // User information
        createdBy: user?.uid || '',
        sellerEmail: user?.email || '',
        sellerName: user?.displayName || user?.email?.split('@')[0] || 'Anonymous',

        // Status and metadata
        status: 'active',
        condition: 'good',
        location: 'campus',

        // Analytics
        views: 0,
        likes: 0,
        inquiries: 0,

        // Timestamps
        createdAt: new Date(),
        updatedAt: new Date(),

        // Additional fields for better organization
        tags: [],
        featured: false,
        sold: false,
      };

      // Validate product data before sending to store
      console.log('Product data before sending to store:', productData);
      
      // Check for any undefined values
      const checkForUndefined = (obj, path = '') => {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          if (value === undefined) {
            console.error(`Undefined value found at: ${currentPath}`);
            return false;
          }
          if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
            if (!checkForUndefined(value, currentPath)) {
              return false;
            }
          }
        }
        return true;
      };

      if (!checkForUndefined(productData)) {
        throw new Error('Product data contains undefined values');
      }

      await addProductToFirestore(productData);

      // Show success notification with next steps
      showSuccess(
        "Product Listed Successfully!",
        `Your ${formData.title} has been listed and is now visible to buyers.`,
        "View Listing",
        "/listings"
      );

      resetForm();
      router.push("/listings");

    } catch (error) {
      console.error("Error listing product:", error);
      showError(
        "Failed to List Product",
        error.message || "An unexpected error occurred. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Sell Your Product
            </h1>
            <p className="text-muted-foreground text-lg">
              List your item and reach thousands of potential buyers in your campus community
            </p>
          </div>

          {/* Setup Progress */}
          {renderSetupProgress()}

          {/* Form */}
          <div className="card-base rounded-xl p-6 md:p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField
                label="Product Title"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                error={validationErrors.title}
                required
              />

              <TextAreaField
                label="Description"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                error={validationErrors.description}
                required
              />

              <InputField
                label="Price (USD)"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                type="number"
                step="0.01"
                min="0"
                max="10000"
                error={validationErrors.price}
                required
              />

              <ProgressiveCategorySelector
                selectedCategoryId={formData.categoryId}
                selectedSubcategoryId={formData.subcategoryId}
                onCategoryChange={handleCategoryChange}
                onSubcategoryChange={handleSubcategoryChange}
                error={validationErrors.categoryId}
                required
                className="mb-6"
              />

              <FileUpload
                label="Product Images"
                id="image"
                onChange={handleImageChange}
                error={validationErrors.image}
                required
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp"
                maxFiles={5}
                maxSize={5 * 1024 * 1024} // 5MB
              />

              {uploadProgress > 0 && <ProgressBar progress={uploadProgress} />}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => {
                    resetForm();
                    router.push("/");
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Listing Product..." : "List Product"}
                </Button>
              </div>
            </form>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Need help? Check out our{" "}
              <a href="/help" className="text-primary hover:text-accent theme-transition">
                selling guidelines
              </a>{" "}
              for tips on creating great listings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellPage;




