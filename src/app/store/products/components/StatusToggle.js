"use client";
import React, { useState } from "react";
import { PRODUCT_STATUS } from "@/types/store";

const StatusToggle = ({ 
  productId, 
  currentStatus, 
  onStatusChange, 
  disabled = false,
  showConfirmation = true 
}) => {
  const [isChanging, setIsChanging] = useState(false);

  const getStatusInfo = (status) => {
    switch (status) {
      case PRODUCT_STATUS.ACTIVE:
        return {
          label: "Active",
          color: "bg-green-100 text-green-800 border-green-200",
          description: "Visible to buyers and searchable"
        };
      case PRODUCT_STATUS.SOLD:
        return {
          label: "Sold",
          color: "bg-blue-100 text-blue-800 border-blue-200",
          description: "Hidden from search, kept in history"
        };
      case PRODUCT_STATUS.UNAVAILABLE:
        return {
          label: "Unavailable",
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          description: "Temporarily hidden, can be reactivated"
        };
      case PRODUCT_STATUS.DRAFT:
        return {
          label: "Draft",
          color: "bg-gray-100 text-gray-800 border-gray-200",
          description: "Not visible to buyers, work in progress"
        };
      default:
        return {
          label: "Active",
          color: "bg-green-100 text-green-800 border-green-200",
          description: "Visible to buyers and searchable"
        };
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus) return;

    // Show confirmation dialog if enabled
    if (showConfirmation) {
      const statusInfo = getStatusInfo(newStatus);
      const confirmMessage = `Change product status to "${statusInfo.label}"?\n\n${statusInfo.description}`;
      
      if (!confirm(confirmMessage)) {
        return;
      }
    }

    try {
      setIsChanging(true);
      await onStatusChange(productId, newStatus);
    } catch (error) {
      console.error("Error changing status:", error);
      // Error handling is done in the parent component
    } finally {
      setIsChanging(false);
    }
  };

  const currentStatusInfo = getStatusInfo(currentStatus);

  return (
    <div className="relative">
      <select
        value={currentStatus || PRODUCT_STATUS.ACTIVE}
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={disabled || isChanging}
        className={`text-xs border rounded px-2 py-1 min-w-[100px] ${
          disabled || isChanging 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer hover:border-gray-400'
        } ${currentStatusInfo.color}`}
        title={currentStatusInfo.description}
      >
        <option value={PRODUCT_STATUS.ACTIVE}>Active</option>
        <option value={PRODUCT_STATUS.SOLD}>Sold</option>
        <option value={PRODUCT_STATUS.UNAVAILABLE}>Unavailable</option>
        <option value={PRODUCT_STATUS.DRAFT}>Draft</option>
      </select>
      
      {isChanging && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default StatusToggle;