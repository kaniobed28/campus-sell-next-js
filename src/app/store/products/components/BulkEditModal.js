"use client";
import React, { useState } from "react";
import { PRODUCT_STATUS } from "@/types/store";
import storeManagementService from "@/services/storeManagementService";

const BulkEditModal = ({ 
  isOpen, 
  onClose, 
  selectedProducts, 
  onSuccess,
  products 
}) => {
  const [bulkAction, setBulkAction] = useState("");
  const [bulkValue, setBulkValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const selectedProductsData = products.filter(p => selectedProducts.includes(p.id));

  const handleBulkEdit = async () => {
    if (!bulkAction || selectedProducts.length === 0) {
      alert("Please select an action and products to edit");
      return;
    }

    try {
      setIsProcessing(true);

      switch (bulkAction) {
        case "status":
          if (!bulkValue) {
            alert("Please select a status");
            return;
          }
          await storeManagementService.bulkUpdateProductStatus(
            selectedProducts, 
            bulkValue, 
            selectedProductsData[0]?.createdBy
          );
          break;

        case "tags":
          if (!bulkValue.trim()) {
            alert("Please enter tags to add");
            return;
          }
          await bulkAddTags(selectedProducts, bulkValue);
          break;

        case "category":
          if (!bulkValue) {
            alert("Please select a category");
            return;
          }
          await bulkUpdateCategory(selectedProducts, bulkValue);
          break;

        default:
          alert("Invalid bulk action");
          return;
      }

      alert(`Successfully updated ${selectedProducts.length} products`);
      onSuccess();
      onClose();

    } catch (error) {
      console.error("Bulk edit error:", error);
      alert("Failed to update products. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const bulkAddTags = async (productIds, tagsString) => {
    const newTags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    
    // This would need to be implemented in the store management service
    // For now, we'll show a placeholder
    console.log("Bulk adding tags:", newTags, "to products:", productIds);
    throw new Error("Bulk tag editing not yet implemented");
  };

  const bulkUpdateCategory = async (productIds, categoryId) => {
    // This would need to be implemented in the store management service
    // For now, we'll show a placeholder
    console.log("Bulk updating category:", categoryId, "for products:", productIds);
    throw new Error("Bulk category editing not yet implemented");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Bulk Edit ({selectedProducts.length} products)
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isProcessing}
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Selected Products Preview */}
          <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
            <p className="text-sm font-medium text-gray-700 mb-2">Selected Products:</p>
            <div className="space-y-1">
              {selectedProductsData.slice(0, 3).map(product => (
                <div key={product.id} className="text-sm text-gray-600">
                  • {product.title}
                </div>
              ))}
              {selectedProductsData.length > 3 && (
                <div className="text-sm text-gray-500">
                  ... and {selectedProductsData.length - 3} more
                </div>
              )}
            </div>
          </div>

          {/* Bulk Action Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action
            </label>
            <select
              value={bulkAction}
              onChange={(e) => {
                setBulkAction(e.target.value);
                setBulkValue("");
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isProcessing}
            >
              <option value="">Select an action...</option>
              <option value="status">Update Status</option>
              <option value="tags">Add Tags</option>
              <option value="category">Change Category</option>
            </select>
          </div>

          {/* Bulk Value Input */}
          {bulkAction === "status" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status
              </label>
              <select
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              >
                <option value="">Select status...</option>
                <option value={PRODUCT_STATUS.ACTIVE}>Active</option>
                <option value={PRODUCT_STATUS.SOLD}>Sold</option>
                <option value={PRODUCT_STATUS.UNAVAILABLE}>Unavailable</option>
                <option value={PRODUCT_STATUS.DRAFT}>Draft</option>
              </select>
            </div>
          )}

          {bulkAction === "tags" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags to Add (comma-separated)
              </label>
              <input
                type="text"
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                placeholder="e.g. electronics, sale, featured"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              />
              <p className="text-xs text-gray-500 mt-1">
                These tags will be added to existing tags
              </p>
            </div>
          )}

          {bulkAction === "category" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Category
              </label>
              <select
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              >
                <option value="">Select category...</option>
                <option value="electronics">Electronics</option>
                <option value="books">Books</option>
                <option value="clothing">Clothing</option>
                <option value="furniture">Furniture</option>
                <option value="sports">Sports & Recreation</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              onClick={handleBulkEdit}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isProcessing || !bulkAction || !bulkValue}
            >
              {isProcessing ? "Processing..." : "Apply Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkEditModal;