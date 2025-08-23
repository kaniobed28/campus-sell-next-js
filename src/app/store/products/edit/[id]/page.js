"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../../stores/useAuth";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
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

const ProductEditPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = params.id;

  const [product, setProduct] = useState(null);
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
    status: PRODUCT_STATUS.ACTIVE,
    tags: [],
    newImages: []
  });

  useEffect(() => {
    if (user && productId) {
      loadProduct();
    }
  }, [user, productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const productRef = doc(db, "products", productId);
      const productDoc = await getDoc(productRef);

      if (!productDoc.exists()) {
        setError("Product not found");
        return;
      }

      const productData = productDoc.data();

      // Check if user owns this product
      if (productData.createdBy !== user.uid) {
        setError("You don't have permission to edit this product");
        return;
      }

      const productWithId = { id: productDoc.id, ...productData };
      setProduct(productWithId);

      // Populate form data
      setFormData({
        title: productData.title || "",
        description: productData.description || "",
        price: productData.price?.toString() || "",
        categoryId: productData.categoryId || "",
        subcategoryId: productData.subcategoryId || "",
        status: productData.status || PRODUCT_STATUS.ACTIVE,
        tags: productData.tags || [],
        newImages: []
      });

    } catch (err) {
      console.error("Error loading product:", err);
      setError("Failed to load product. Please try again.");
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
      newImages: files
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
    const validation = validateProductForm(formData);
    
    // Additional validation for new images if any
    if (formData.newImages && formData.newImages.length > 0) {
      const imageValidation = validateImageFiles(formData.newImages);
      if (!imageValidation.isValid) {
        validation.errors.newImages = imageValidation.errors.join(", ");
      }
    }
    
    setValidationErrors(validation.errors);
    return validation.isValid && (!formData.newImages || formData.newImages.length === 0 || validateImageFiles(formData.newImages).isValid);
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

      // Upload new images if any
      let newImageUrls = [];
      if (formData.newImages && formData.newImages.length > 0) {
        newImageUrls = await uploadImages(formData.newImages);
      }

      // Prepare update data using sanitization utility
      const sanitizedData = sanitizeProductData(formData);
      const updateData = {
        ...sanitizedData,
        updatedAt: serverTimestamp(),
        lastEditedAt: serverTimestamp()
      };

      // Add new images to existing ones
      if (newImageUrls.length > 0) {
        updateData.imageUrls = [...(product.imageUrls || []), ...newImageUrls];
      }

      // Update product in database
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, updateData);

      // Log the activity
      await storeManagementService.logActivity(user.uid, "product_updated", {
        productId,
        description: `Product "${formData.title}" was updated`,
        metadata: { 
          fieldsUpdated: Object.keys(updateData),
          newImagesAdded: newImageUrls.length
        }
      });

      alert("Product updated successfully!");
      router.push("/store/products");

    } catch (err) {
      console.error("Error updating product:", err);
      setError("Failed to update product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${product.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await storeManagementService.deleteProduct(productId, user.uid);
      alert("Product deleted successfully");
      router.push("/store/products");
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product. Please try again.");
    }
  };

  const removeExistingImage = (indexToRemove) => {
    if (!confirm("Are you sure you want to remove this image?")) {
      return;
    }

    const updatedImageUrls = product.imageUrls.filter((_, index) => index !== indexToRemove);
    setProduct(prev => ({
      ...prev,
      imageUrls: updatedImageUrls
    }));

    // Update in database immediately
    const productRef = doc(db, "products", productId);
    updateDoc(productRef, {
      imageUrls: updatedImageUrls,
      updatedAt: serverTimestamp()
    }).catch(err => {
      console.error("Error removing image:", err);
      alert("Failed to remove image. Please try again.");
      // Revert the change
      setProduct(prev => ({
        ...prev,
        imageUrls: product.imageUrls
      }));
    });
  };

  if (loading) {
    return <Loading message="Loading product..." />;
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
              onClick={loadProduct}
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
                Edit Product
              </h1>
              <p className="text-muted-foreground">
                Update your product details and manage your listing
              </p>
            </div>
            <button
              onClick={() => router.push("/store/products")}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Products
            </button>
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
                  <option value={PRODUCT_STATUS.ACTIVE}>Active</option>
                  <option value={PRODUCT_STATUS.SOLD}>Sold</option>
                  <option value={PRODUCT_STATUS.UNAVAILABLE}>Unavailable</option>
                  <option value={PRODUCT_STATUS.DRAFT}>Draft</option>
                </select>
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
                  Add tags to help buyers find your product
                </p>
              </div>

              {/* Existing Images */}
              {product.imageUrls && product.imageUrls.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Images
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {product.imageUrls.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Images */}
              <FileUpload
                label="Add New Images"
                id="newImages"
                onChange={handleImageChange}
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp"
                maxFiles={5}
                maxSize={5 * 1024 * 1024} // 5MB
              />

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
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                  onClick={handleDelete}
                  disabled={saving}
                >
                  Delete Product
                </Button>
                
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  loading={saving}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>

          {/* Product Preview Link */}
          <div className="mt-6 text-center">
            <a
              href={`/listings/${productId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View Public Listing →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductEditPage;