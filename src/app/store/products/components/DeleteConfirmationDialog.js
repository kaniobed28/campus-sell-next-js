"use client";
import React, { useState, useEffect } from "react";

const DeleteConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  product,
  isProcessing = false 
}) => {
  const [confirmText, setConfirmText] = useState("");
  const [hasActiveInquiries, setHasActiveInquiries] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    if (isOpen && product) {
      checkProductDependencies();
    }
  }, [isOpen, product]);

  const checkProductDependencies = async () => {
    // Mock check for active inquiries and cart items
    // In real implementation, this would query the database
    const mockInquiries = Math.random() > 0.7; // 30% chance of having inquiries
    const mockInCart = Math.random() > 0.8; // 20% chance of being in cart
    
    setHasActiveInquiries(mockInquiries);
    setIsInCart(mockInCart);

    // Generate warnings based on product data
    const newWarnings = [];
    
    if (mockInquiries) {
      newWarnings.push({
        type: 'error',
        icon: '💬',
        title: 'Active Inquiries',
        message: 'This product has active buyer inquiries. Deleting will remove all conversation history.'
      });
    }

    if (mockInCart) {
      newWarnings.push({
        type: 'error',
        icon: '🛒',
        title: 'In Shopping Carts',
        message: 'This product is currently in buyer shopping carts. Deleting will remove it from their carts.'
      });
    }

    if (product.viewCount > 50) {
      newWarnings.push({
        type: 'warning',
        icon: '👁️',
        title: 'High View Count',
        message: `This product has ${product.viewCount} views. Consider marking as "Unavailable" instead of deleting.`
      });
    }

    if (product.status === 'active') {
      newWarnings.push({
        type: 'warning',
        icon: '🔍',
        title: 'Currently Active',
        message: 'This product is currently visible to buyers. Deleting will immediately remove it from search results.'
      });
    }

    if (product.imageUrls && product.imageUrls.length > 0) {
      newWarnings.push({
        type: 'info',
        icon: '🖼️',
        title: 'Images Will Be Deleted',
        message: `${product.imageUrls.length} image(s) associated with this product will also be permanently deleted.`
      });
    }

    setWarnings(newWarnings);
  };

  if (!isOpen || !product) return null;

  const hasBlockingIssues = hasActiveInquiries || isInCart;
  const confirmationRequired = product.title;
  const isConfirmationValid = confirmText.toLowerCase() === confirmationRequired.toLowerCase();

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
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center mb-4">
          <div className="text-2xl mr-3">🗑️</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Delete Product
            </h3>
            <p className="text-sm text-gray-600">
              This action cannot be undone
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Product Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              {product.imageUrls && product.imageUrls[0] ? (
                <img
                  src={product.imageUrls[0]}
                  alt={product.title}
                  className="w-12 h-12 object-cover rounded-lg"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">📷</span>
                </div>
              )}
              <div>
                <h4 className="font-medium text-gray-900">{product.title}</h4>
                <p className="text-sm text-gray-600">${product.price}</p>
                <p className="text-xs text-gray-500">
                  Created {new Date(product.createdAt?.seconds ? product.createdAt.seconds * 1000 : product.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Before you delete:</h4>
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

          {/* Blocking Issues */}
          {hasBlockingIssues && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="text-red-600 mr-2">🚫</div>
                <div className="text-sm text-red-800">
                  <strong>Cannot Delete:</strong> This product has active dependencies. 
                  Please resolve the issues above before deleting, or consider marking the product as "Unavailable" instead.
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
                    <strong>This action is permanent.</strong> The product, all its data, images, and associated analytics will be permanently deleted.
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type the product title to confirm deletion:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={product.title}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  disabled={isProcessing}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This helps prevent accidental deletions
                </p>
              </div>
            </div>
          )}

          {/* Alternative Actions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-900 mb-2">Consider these alternatives:</h5>
            <div className="space-y-2 text-sm text-blue-800">
              <div>• Mark as "Sold" to hide from buyers but keep in your history</div>
              <div>• Mark as "Unavailable" to temporarily hide the product</div>
              <div>• Edit the product to update details instead of deleting</div>
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
              onClick={() => onConfirm(product.id)}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isProcessing || !isConfirmationValid}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </div>
              ) : (
                'Delete Product'
              )}
            </button>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Need help? <a href="/help/product-management" className="text-blue-600 hover:text-blue-800">Learn about product management</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationDialog;