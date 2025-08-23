"use client";
import React, { useState, useEffect } from "react";

const BulkDeleteConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  selectedProducts,
  products,
  isProcessing = false 
}) => {
  const [confirmText, setConfirmText] = useState("");
  const [warnings, setWarnings] = useState([]);
  const [blockingIssues, setBlockingIssues] = useState([]);

  useEffect(() => {
    if (isOpen && selectedProducts.length > 0) {
      analyzeSelectedProducts();
    }
  }, [isOpen, selectedProducts, products]);

  const analyzeSelectedProducts = () => {
    const selectedProductsData = products.filter(p => selectedProducts.includes(p.id));
    const newWarnings = [];
    const newBlockingIssues = [];

    // Analyze each product
    let totalViews = 0;
    let totalImages = 0;
    let activeProducts = 0;
    let highValueProducts = 0;
    let productsWithInquiries = 0;
    let productsInCarts = 0;

    selectedProductsData.forEach(product => {
      totalViews += product.viewCount || 0;
      totalImages += product.imageUrls?.length || 0;
      
      if (product.status === 'active') {
        activeProducts++;
      }
      
      if (product.price > 100) {
        highValueProducts++;
      }

      // Mock check for inquiries and cart items
      if (Math.random() > 0.8) { // 20% chance
        productsWithInquiries++;
      }
      
      if (Math.random() > 0.9) { // 10% chance
        productsInCarts++;
      }
    });

    // Generate warnings
    if (activeProducts > 0) {
      newWarnings.push({
        type: 'warning',
        icon: '🔍',
        title: `${activeProducts} Active Products`,
        message: 'These products are currently visible to buyers and will be immediately removed from search results.'
      });
    }

    if (totalViews > 100) {
      newWarnings.push({
        type: 'warning',
        icon: '👁️',
        title: 'High Total Views',
        message: `Selected products have ${totalViews} total views. Consider alternative actions before deleting.`
      });
    }

    if (highValueProducts > 0) {
      newWarnings.push({
        type: 'warning',
        icon: '💰',
        title: `${highValueProducts} High-Value Products`,
        message: 'Some selected products have high prices. Double-check this selection.'
      });
    }

    if (totalImages > 0) {
      newWarnings.push({
        type: 'info',
        icon: '🖼️',
        title: 'Images Will Be Deleted',
        message: `${totalImages} images across all selected products will be permanently deleted.`
      });
    }

    // Generate blocking issues
    if (productsWithInquiries > 0) {
      newBlockingIssues.push({
        type: 'error',
        icon: '💬',
        title: `${productsWithInquiries} Products with Active Inquiries`,
        message: 'These products have active buyer conversations. Deleting will remove all message history.'
      });
    }

    if (productsInCarts > 0) {
      newBlockingIssues.push({
        type: 'error',
        icon: '🛒',
        title: `${productsInCarts} Products in Shopping Carts`,
        message: 'These products are currently in buyer shopping carts and will be removed.'
      });
    }

    // Large bulk operation warning
    if (selectedProducts.length > 10) {
      newWarnings.push({
        type: 'error',
        icon: '🚨',
        title: 'Large Bulk Operation',
        message: `You are about to delete ${selectedProducts.length} products. This is a significant action that cannot be undone.`
      });
    }

    setWarnings(newWarnings);
    setBlockingIssues(newBlockingIssues);
  };

  if (!isOpen) return null;

  const selectedProductsData = products.filter(p => selectedProducts.includes(p.id));
  const hasBlockingIssues = blockingIssues.length > 0;
  const confirmationText = `DELETE ${selectedProducts.length} PRODUCTS`;
  const isConfirmationValid = confirmText === confirmationText;

  const getWarningStyle = (type) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center mb-4">
          <div className="text-2xl mr-3">🗑️</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Bulk Delete Products
            </h3>
            <p className="text-sm text-gray-600">
              Delete {selectedProducts.length} products permanently
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Selected Products Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Products to be deleted:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
              {selectedProductsData.slice(0, 6).map(product => (
                <div key={product.id} className="flex items-center space-x-2 text-sm">
                  {product.imageUrls && product.imageUrls[0] ? (
                    <img
                      src={product.imageUrls[0]}
                      alt={product.title}
                      className="w-8 h-8 object-cover rounded"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs">📷</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 truncate">{product.title}</p>
                    <p className="text-gray-500">${product.price}</p>
                  </div>
                </div>
              ))}
              {selectedProductsData.length > 6 && (
                <div className="col-span-2 text-center text-sm text-gray-500 py-2">
                  ... and {selectedProductsData.length - 6} more products
                </div>
              )}
            </div>
          </div>

          {/* Blocking Issues */}
          {blockingIssues.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-red-900">Issues that must be resolved:</h4>
              {blockingIssues.map((issue, index) => (
                <div key={index} className={`rounded-lg p-3 border ${getWarningStyle(issue.type)}`}>
                  <div className="flex items-start">
                    <span className="text-lg mr-2">{issue.icon}</span>
                    <div>
                      <h5 className="font-medium">{issue.title}</h5>
                      <p className="text-sm mt-1">{issue.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Important considerations:</h4>
              {warnings.map((warning, index) => (
                <div key={index} className={`rounded-lg p-3 border ${getWarningStyle(warning.type)}`}>
                  <div className="flex items-start">
                    <span className="text-lg mr-2">{warning.icon}</span>
                    <div>
                      <h5 className="font-medium">{warning.title}</h5>
                      <p className="text-sm mt-1">{warning.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Blocking Message */}
          {hasBlockingIssues && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="text-red-600 mr-2">🚫</div>
                <div className="text-sm text-red-800">
                  <strong>Cannot Delete:</strong> Some products have active dependencies. 
                  Please resolve the issues above, or consider using bulk status changes to mark products as "Unavailable" instead.
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Input */}
          {!hasBlockingIssues && (
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="text-red-600 mr-2">⚠️</div>
                  <div className="text-sm text-red-800">
                    <strong>This action is permanent and cannot be undone.</strong> All selected products, their data, images, and analytics will be permanently deleted.
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type "{confirmationText}" to confirm bulk deletion:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={confirmationText}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono"
                  disabled={isProcessing}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This confirmation helps prevent accidental bulk deletions
                </p>
              </div>
            </div>
          )}

          {/* Alternative Actions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-900 mb-2">Consider these alternatives:</h5>
            <div className="space-y-2 text-sm text-blue-800">
              <div>• Use bulk status change to mark products as "Sold" or "Unavailable"</div>
              <div>• Export product data before deleting for your records</div>
              <div>• Delete products individually for more control</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            disabled={isProcessing}
          >
            Cancel
          </button>
          
          {!hasBlockingIssues && (
            <button
              onClick={() => onConfirm(selectedProducts)}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isProcessing || !isConfirmationValid}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting {selectedProducts.length} products...
                </div>
              ) : (
                `Delete ${selectedProducts.length} Products`
              )}
            </button>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Need help? <a href="/help/bulk-operations" className="text-blue-600 hover:text-blue-800">Learn about bulk operations</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BulkDeleteConfirmationDialog;