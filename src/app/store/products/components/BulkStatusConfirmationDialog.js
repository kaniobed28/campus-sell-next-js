"use client";
import React from "react";
import { PRODUCT_STATUS } from "@/types/store";

const BulkStatusConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  selectedProducts, 
  products,
  newStatus,
  isProcessing = false 
}) => {
  if (!isOpen) return null;

  const selectedProductsData = products.filter(p => selectedProducts.includes(p.id));

  const getStatusInfo = (status) => {
    switch (status) {
      case PRODUCT_STATUS.ACTIVE:
        return {
          label: "Active",
          color: "text-green-600",
          bgColor: "bg-green-50 border-green-200",
          icon: "✅",
          description: "Products will be visible to buyers and appear in search results.",
          impact: "Buyers can view and inquire about these products."
        };
      case PRODUCT_STATUS.SOLD:
        return {
          label: "Sold",
          color: "text-blue-600",
          bgColor: "bg-blue-50 border-blue-200",
          icon: "💰",
          description: "Products will be hidden from search results but kept in your history.",
          impact: "Buyers will no longer see these products in listings."
        };
      case PRODUCT_STATUS.UNAVAILABLE:
        return {
          label: "Unavailable",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50 border-yellow-200",
          icon: "⏸️",
          description: "Products will be temporarily hidden from buyers.",
          impact: "You can reactivate these products later when they become available."
        };
      case PRODUCT_STATUS.DRAFT:
        return {
          label: "Draft",
          color: "text-gray-600",
          bgColor: "bg-gray-50 border-gray-200",
          icon: "📝",
          description: "Products will be saved as drafts and not visible to buyers.",
          impact: "You can continue editing and publish when ready."
        };
      default:
        return {
          label: "Unknown",
          color: "text-gray-600",
          bgColor: "bg-gray-50 border-gray-200",
          icon: "❓",
          description: "Status change requested.",
          impact: ""
        };
    }
  };

  const statusInfo = getStatusInfo(newStatus);

  // Group products by current status
  const statusGroups = selectedProductsData.reduce((groups, product) => {
    const currentStatus = product.status || PRODUCT_STATUS.ACTIVE;
    if (!groups[currentStatus]) {
      groups[currentStatus] = [];
    }
    groups[currentStatus].push(product);
    return groups;
  }, {});

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center mb-4">
          <div className="text-2xl mr-3">{statusInfo.icon}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Bulk Status Change
            </h3>
            <p className="text-sm text-gray-600">
              Change {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} to "{statusInfo.label}"
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Status Change Summary */}
          <div className={`rounded-lg p-4 border ${statusInfo.bgColor}`}>
            <div className="flex items-center mb-2">
              <span className="text-lg mr-2">{statusInfo.icon}</span>
              <span className={`font-medium ${statusInfo.color}`}>
                New Status: {statusInfo.label}
              </span>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              {statusInfo.description}
            </p>
            {statusInfo.impact && (
              <p className="text-sm text-gray-600">
                <strong>Impact:</strong> {statusInfo.impact}
              </p>
            )}
          </div>

          {/* Products by Current Status */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Products to be updated:</h4>
            {Object.entries(statusGroups).map(([currentStatus, products]) => (
              <div key={currentStatus} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Currently {getStatusInfo(currentStatus).label} ({products.length})
                  </span>
                  <span className="text-xs text-gray-500">
                    → {statusInfo.label}
                  </span>
                </div>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {products.slice(0, 3).map(product => (
                    <div key={product.id} className="text-sm text-gray-600 truncate">
                      • {product.title}
                    </div>
                  ))}
                  {products.length > 3 && (
                    <div className="text-sm text-gray-500">
                      ... and {products.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Warning for certain status changes */}
          {(newStatus === PRODUCT_STATUS.SOLD || newStatus === PRODUCT_STATUS.UNAVAILABLE) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start">
                <div className="text-yellow-600 mr-2">⚠️</div>
                <div className="text-sm text-yellow-800">
                  <strong>Note:</strong> This will hide all selected products from buyers. 
                  You can change them back to "Active" anytime to make them visible again.
                </div>
              </div>
            </div>
          )}

          {/* Confirmation checkbox for large bulk operations */}
          {selectedProducts.length > 10 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start">
                <div className="text-red-600 mr-2">🚨</div>
                <div className="text-sm text-red-800">
                  <strong>Large Bulk Operation:</strong> You are about to change the status of {selectedProducts.length} products. 
                  This action cannot be easily undone.
                </div>
              </div>
            </div>
          )}
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
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-md text-white font-medium disabled:opacity-50 ${
              newStatus === PRODUCT_STATUS.ACTIVE ? 'bg-green-600 hover:bg-green-700' :
              newStatus === PRODUCT_STATUS.SOLD ? 'bg-blue-600 hover:bg-blue-700' :
              newStatus === PRODUCT_STATUS.UNAVAILABLE ? 'bg-yellow-600 hover:bg-yellow-700' :
              'bg-gray-600 hover:bg-gray-700'
            }`}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating {selectedProducts.length} products...
              </div>
            ) : (
              `Update ${selectedProducts.length} Product${selectedProducts.length !== 1 ? 's' : ''}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkStatusConfirmationDialog;