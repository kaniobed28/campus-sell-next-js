"use client";
import React from "react";
import { PRODUCT_STATUS } from "@/types/store";

const StatusConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  productTitle, 
  currentStatus, 
  newStatus,
  isProcessing = false 
}) => {
  if (!isOpen) return null;

  const getStatusInfo = (status) => {
    switch (status) {
      case PRODUCT_STATUS.ACTIVE:
        return {
          label: "Active",
          color: "text-green-600",
          icon: "✅",
          description: "Your product will be visible to buyers and appear in search results.",
          impact: "Buyers can view and inquire about this product."
        };
      case PRODUCT_STATUS.SOLD:
        return {
          label: "Sold",
          color: "text-blue-600",
          icon: "💰",
          description: "Your product will be hidden from search results but kept in your history.",
          impact: "Buyers will no longer see this product in listings."
        };
      case PRODUCT_STATUS.UNAVAILABLE:
        return {
          label: "Unavailable",
          color: "text-yellow-600",
          icon: "⏸️",
          description: "Your product will be temporarily hidden from buyers.",
          impact: "You can reactivate this product later when it becomes available."
        };
      case PRODUCT_STATUS.DRAFT:
        return {
          label: "Draft",
          color: "text-gray-600",
          icon: "📝",
          description: "Your product will be saved as a draft and not visible to buyers.",
          impact: "You can continue editing and publish when ready."
        };
      default:
        return {
          label: "Unknown",
          color: "text-gray-600",
          icon: "❓",
          description: "Status change requested.",
          impact: ""
        };
    }
  };

  const newStatusInfo = getStatusInfo(newStatus);
  const currentStatusInfo = getStatusInfo(currentStatus);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center mb-4">
          <div className="text-2xl mr-3">{newStatusInfo.icon}</div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Change Product Status
            </h3>
            <p className="text-sm text-muted-foreground">
              Confirm status change for "{productTitle}"
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Status Change Summary */}
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-muted-foreground">From:</span>
                <span className={`ml-2 font-medium ${currentStatusInfo.color}`}>
                  {currentStatusInfo.label}
                </span>
              </div>
              <div className="text-gray-400">→</div>
              <div>
                <span className="text-gray-600">To:</span>
                <span className={`ml-2 font-medium ${newStatusInfo.color}`}>
                  {newStatusInfo.label}
                </span>
              </div>
            </div>
          </div>

          {/* New Status Description */}
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              <strong>What this means:</strong>
            </p>
            <p className="text-sm text-gray-600">
              {newStatusInfo.description}
            </p>
            {newStatusInfo.impact && (
              <p className="text-sm text-gray-600">
                <strong>Impact:</strong> {newStatusInfo.impact}
              </p>
            )}
          </div>

          {/* Warning for certain status changes */}
          {(newStatus === PRODUCT_STATUS.SOLD || newStatus === PRODUCT_STATUS.UNAVAILABLE) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start">
                <div className="text-yellow-600 mr-2">⚠️</div>
                <div className="text-sm text-yellow-800">
                  <strong>Note:</strong> This will hide your product from buyers. 
                  You can change it back to "Active" anytime to make it visible again.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border rounded-md text-muted-foreground hover:bg-muted disabled:opacity-50"
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
              'bg-muted-foreground hover:opacity-90'
            }`}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </div>
            ) : (
              `Change to ${newStatusInfo.label}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusConfirmationDialog;