"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../../stores/useAuth";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Loading from "@/components/Loading";
import InputField from "../../../../sell/components/InputField";
import TextAreaField from "../../../../sell/components/TextAreaField";
import FileUpload from "../../../../sell/components/FileUpload";
import ProgressBar from "../../../../sell/components/ProgressBar";
import ProgressiveCategorySelector from "@/components/ProgressiveCategorySelector";
import { Button } from "@/components/ui/Button";
import storeManagementService from "@/services/storeManagementService";
import { PRODUCT_STATUS } from "@/types/store";
import { validateProductForm, sanitizeProductData, validateImageFiles } from "../../utils/productValidation";

const ProductDuplicatePage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const originalProductId = params.id;

  const [originalProduct, setOriginalProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});

  // Form data state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    categoryId: "",
    subcategoryId: "",
    status: PRODUCT_STATUS.DRAFT,
    tags: [],
    images: []
  });

  useEffect(() => {
    if (user && originalProductId) {
      loadOriginalProduct();
    }
  }, [user, originalProductId]);

  const loadOriginalProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const productRef = doc(db, "products", originalProductId);
      const productDoc = await getDoc(productRef);

      if (!productDoc.exists()) {
        setError("Original product not found");
        return;
      }

      const productData = productDoc.data();

      // Check if user owns this product
      if (productData.createdBy !== user.uid) {
        setError("You don't have permission to duplicate this product");
        return;
      }

      const productWithId = { id: productDoc.id, ...productData };
      setOriginalProduct(productWithId);

      // Populate form data with duplicated values
      setFormData({
        title: `${productData.title} (Copy)`,
        description: productData.description || "",
        price: productData.price?.toString() || "",
        categoryId: productData.categoryId || "",
        subcategoryId: productData.subcategoryId || "",
        category: productData.category || "",
        subcategory: productData.subcategory || "",
        status: PRODUCT_STATUS.DRAFT, // Always start as draft
        tags: [...(productData.tags || [])],
        images: [] // Don't copy images for security reasons
      });

    } catch (err) {
      console.error("Error loading original product:", err);
      setError("Failed to load original product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleCategoryChange = (categoryId, category) => {
    setFormData(prev => ({
      ...prev,
      categoryId: categoryId,
      category: category?.name || ""
    }));
    
    if (validationErrors.categoryId) {
      setValidationErrors(prev => ({
        ...prev,
        categoryId: null
      }));
    }
  };

  const handleSubcategoryChange = (subcategoryId, subcategory) => {
    setFormData(prev => ({
      ...prev,
      subcategoryId: subcategoryId,
      subcategory: subcategory?.name || ""
    }));
  };

  const handleImageChange = (files) => {
    setFormData(prev => ({
      ...prev,
      images: files
    }));
  };

  const handleTagsChange = (e) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setFormData(prev => ({
      ...prev,
      tags: tagsArray
    }));
  };

  const validateForm = () => {
    const validation = validateProductForm(formData, { requireImages: true });
    
    // Additional validation for images
    if (formData.images && formData.images.length > 0) {
      const imageValidation = validateImageFiles(formData.images);
      if (!imageValidation.isValid) {
        validation.errors.images = imageValidation.errors.join(", ");
      }
    }
    
    setValidationErrors(validation.errors);
    return validation.isValid && validateImageFiles(formData.images).isValid;
  };

  const uploadImages = async (files) => {
    if (!files || files.length === 0) return [];

    // Mock image upload - in real implementation, this would upload to Firebase Storage
    setUploadProgress(25);
    await new Promise(resolve => setTimeout(resolve, 500));
    setUploadProgress(50);
    await new Promise(resolve => setTimeout(resolve, 500));
    setUploadProgress(75);
    await new Promise(resolve => setTimeout(resolve, 500));
    setUploadProgress(100);

    // Return mock URLs - in real implementation, these would be actual uploaded URLs
    const mockUrls = Array.from(files).map((file, index) => 
      `https://example.com/uploads/${Date.now()}_${index}_${file.name}`
    );

    setUploadProgress(0);
    return mockUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Please fix the form errors before saving");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Upload images
      const imageUrls = await uploadImages(formData.images);

      // Prepare product data using sanitization utility
      const sanitizedData = sanitizeProductData(formData);
      const productData = {
        ...sanitizedData,
        imageUrls: imageUrls,
        
        // User information
        createdBy: user.uid,
        sellerEmail: user.email,
        sellerName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        
        // Analytics fields
        viewCount: 0,
        inquiryCount: 0,
        favoriteCount: 0,
        
        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Duplication metadata
        duplicatedFrom: originalProductId,
        isDuplicate: true
      };

      // Create new product in database
      const docRef = await addDoc(collection(db, "products"), productData);

      // Log the activity
      await storeManagementService.logActivity(user.uid, "product_created", {
        productId: docRef.id,
        description: `Product "${formData.title}" was created as a duplicate`,
        metadata: { 
          originalProductId,
          originalTitle: originalProduct.title
        }
      });

      alert("Product duplicated successfully!");
      router.push(`/store/products/edit/${docRef.id}`);

    } catch (err) {
      console.error("Error duplicating product:", err);
      setError("Failed to duplicate product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading message="Loading original product..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ {error}</div>
          <div className="space-x-4">
            <button
              onClick={() => router.push("/store/products")}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Back to Products
            </button>
            <button
              onClick={loadOriginalProduct}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Duplicate Product
              </h1>
              <p className="text-muted-foreground">
                Review and modify the duplicated product details
              </p>
            </div>
            <button
              onClick={() => router.push("/store/products")}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Products
            </button>
          </div>

          {/* Original Product Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">Duplicating from:</h3>
            <div className="flex items-center space-x-3">
              {originalProduct.imageUrls && originalProduct.imageUrls[0] && (
                <img
                  src={originalProduct.imageUrls[0]}
                  alt={originalProduct.title}
                  className="w-12 h-12 object-cover rounded-lg"
                />
              )}
              <div>
                <p className="font-medium text-blue-900">{originalProduct.title}</p>
                <p className="text-sm text-blue-700">${originalProduct.price}</p>
              </div>
            </div>
          </div>

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

              {/* Status Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={PRODUCT_STATUS.DRAFT}>Draft (Recommended)</option>
                  <option value={PRODUCT_STATUS.ACTIVE}>Active</option>
                  <option value={PRODUCT_STATUS.UNAVAILABLE}>Unavailable</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Draft status allows you to review before making it public
                </p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={handleTagsChange}
                  placeholder="e.g. electronics, laptop, gaming"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Tags from the original product have been copied
                </p>
              </div>

              {/* Images - Required for duplicates */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 mb-3">
                  <strong>Note:</strong> Images are not copied for security reasons. 
                  Please upload new images for the duplicated product.
                </p>
                <FileUpload
                  label="Product Images (Required)"
                  id="images"
                  onChange={handleImageChange}
                  error={validationErrors.images}
                  required
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  maxFiles={5}
                  maxSize={5 * 1024 * 1024} // 5MB
                />
              </div>

              {uploadProgress > 0 && <ProgressBar progress={uploadProgress} />}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => router.push("/store/products")}
                  disabled={saving}
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  loading={saving}
                  disabled={saving}
                >
                  {saving ? "Creating Duplicate..." : "Create Duplicate"}
                </Button>
              </div>
            </form>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              The duplicated product will be created as a draft. You can edit it further after creation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDuplicatePage;